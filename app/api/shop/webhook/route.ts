import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type { PrintifyAddress } from "@/lib/printify";
import { fulfillShopOrder } from "@/lib/shop-fulfillment";
import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import { resend, EMAIL_FROM, isResendConfigured } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/lib/emails/order-confirmation";
import { DonationThankYouEmail } from "@/lib/emails/donation-thank-you";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Handle donations
    if (
      session.payment_status === "paid" &&
      session.metadata?.type === "donation"
    ) {
      const donorName = session.metadata.donor_name || "";
      const donorEmail =
        session.metadata.donor_email || session.customer_email || "";
      const amountCents = session.amount_total || 0;
      const amountDollars = (amountCents / 100).toFixed(2);

      console.log(
        `Donation received: $${amountDollars} from ${donorName || "Anonymous"} (${donorEmail || "no email"})`
      );

      if (donorEmail && isResendConfigured() && resend) {
        try {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: donorEmail,
            subject: `Thank you for your donation to DEVSA!`,
            html: DonationThankYouEmail({
              name: donorName || "Friend",
              amount: amountDollars,
            }),
          });
        } catch (emailErr) {
          console.error("Failed to send donation thank-you email:", emailErr);
        }
      }

      return NextResponse.json({ received: true });
    }

    // Handle shop orders
    if (session.payment_status === "paid" && session.metadata?.line_items) {
      const shipping = JSON.parse(
        session.metadata.shipping || "{}"
      ) as PrintifyAddress & { email?: string };
      const lineItems = JSON.parse(
        session.metadata.line_items || "[]"
      ) as Array<{
        product_id: string;
        variant_id: number;
        quantity: number;
      }>;

      const customerEmail = shipping.email || session.customer_email || "";

      if (lineItems.length > 0) {
        let result;
        try {
          // Submit to Printify, send to production, and record the order.
          // Idempotent on session.id, so Stripe webhook retries are safe.
          result = await fulfillShopOrder({
            sessionId: session.id,
            lineItems,
            shipping,
            customerEmail,
            amountTotalCents: session.amount_total,
          });
        } catch (err) {
          console.error("Failed to create Printify order from webhook:", err);
          // Log to Firestore for manual resolution
          try {
            const db = getDb();
            await db.collection(COLLECTIONS.FAILED_ORDERS).add({
              stripeSessionId: session.id,
              orderId: `DEVSA-failed-${session.id.slice(-8)}`,
              error: err instanceof Error ? err.message : String(err),
              customerEmail,
              shipping: session.metadata.shipping,
              lineItems: session.metadata.line_items,
              timestamp: new Date().toISOString(),
              resolved: false,
            });
          } catch (logErr) {
            console.error("Failed to log failed order to Firestore:", logErr);
          }
          return NextResponse.json({ received: true });
        }

        // Only email on first successful fulfillment (skip on webhook retries).
        if (
          result.status === "fulfilled" &&
          customerEmail &&
          isResendConfigured() &&
          resend
        ) {
          try {
            await resend.emails.send({
              from: EMAIL_FROM,
              to: customerEmail,
              subject: `Order Confirmed – ${result.label}`,
              html: OrderConfirmationEmail({
                firstName: shipping.first_name || "there",
                lastName: shipping.last_name || "",
                email: customerEmail,
                orderId: result.label,
                items: lineItems,
                shippingAddress: {
                  address1: shipping.address1 || "",
                  city: shipping.city || "",
                  region: shipping.region || "",
                  zip: shipping.zip || "",
                  country: shipping.country || "US",
                },
              }),
            });
          } catch (emailErr) {
            console.error("Failed to send order confirmation email:", emailErr);
            // Non-blocking — order was already placed
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
