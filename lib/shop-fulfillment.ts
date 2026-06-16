import { submitOrder, sendOrderToProduction } from "@/lib/printify";
import type { PrintifyAddress } from "@/lib/printify";
import { getDb, COLLECTIONS } from "@/lib/firebase-admin";

export interface ShopLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

export interface FulfillShopOrderInput {
  /** Stripe checkout session id — used as the idempotency key and Printify external_id. */
  sessionId: string;
  lineItems: ShopLineItem[];
  shipping: Partial<PrintifyAddress> & { email?: string };
  customerEmail: string;
  amountTotalCents?: number | null;
}

export type FulfillResult =
  | { status: "already_recorded"; printifyOrderId: string | null }
  | {
      status: "fulfilled";
      printifyOrderId: string;
      label: string;
      production: "sent" | "failed";
      productionError?: string;
    };

/**
 * Fulfill a paid shop order end-to-end:
 *   1. (idempotency) skip if this Stripe session was already fulfilled
 *   2. submit the order to Printify
 *   3. send it to production (orders are created on-hold)
 *   4. record it in the ORDERS collection for audit / reconciliation
 *
 * Shared by the Stripe webhook and the reconciliation route so both paths
 * behave identically and never double-ship a session.
 */
export async function fulfillShopOrder(
  input: FulfillShopOrderInput
): Promise<FulfillResult> {
  const { sessionId, lineItems, shipping, customerEmail, amountTotalCents } =
    input;
  const db = getDb();

  // Idempotency: never fulfill the same Stripe session twice. Guards against
  // Stripe webhook retries and overlap with the reconciliation job.
  const existing = await db
    .collection(COLLECTIONS.ORDERS)
    .where("stripeSessionId", "==", sessionId)
    .limit(1)
    .get();
  if (!existing.empty) {
    return {
      status: "already_recorded",
      printifyOrderId: existing.docs[0].data().printifyOrderId ?? null,
    };
  }

  const label = `DEVSA-${Date.now()}`;
  const order = await submitOrder({
    external_id: `stripe-${sessionId}`,
    label,
    line_items: lineItems,
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: {
      first_name: shipping.first_name || "",
      last_name: shipping.last_name || "",
      email: customerEmail,
      phone: shipping.phone || "",
      country: shipping.country || "US",
      region: shipping.region || "",
      address1: shipping.address1 || "",
      address2: shipping.address2 || "",
      city: shipping.city || "",
      zip: shipping.zip || "",
    },
  });

  // Record immediately after submit so a paid session can never be lost,
  // even if send-to-production or anything after it throws.
  const docRef = await db.collection(COLLECTIONS.ORDERS).add({
    stripeSessionId: sessionId,
    printifyOrderId: order.id,
    label,
    customerEmail,
    amountTotalCents: amountTotalCents ?? null,
    lineItems,
    shipping,
    production: "pending",
    productionError: null,
    createdAt: new Date().toISOString(),
  });

  let production: "sent" | "failed" = "sent";
  let productionError: string | undefined;
  try {
    await sendOrderToProduction(order.id);
    await docRef.update({ production: "sent" });
  } catch (err) {
    production = "failed";
    productionError = err instanceof Error ? err.message : String(err);
    console.error(
      `Order ${order.id} submitted but send-to-production failed:`,
      productionError
    );
    await docRef.update({ production: "failed", productionError });
  }

  return { status: "fulfilled", printifyOrderId: order.id, label, production };
}
