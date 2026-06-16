import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDb, COLLECTIONS } from "@/lib/firebase-admin";
import { fulfillShopOrder, type ShopLineItem } from "@/lib/shop-fulfillment";
import type { PrintifyAddress } from "@/lib/printify";

const CRON_SECRET = process.env.CRON_SECRET;

interface PaidShopSession {
  id: string;
  lineItems: ShopLineItem[];
  shipping: Partial<PrintifyAddress> & { email?: string };
  email: string;
  amountCents: number | null;
  created: number;
}

/**
 * Reconciliation: find paid Stripe shop sessions that never produced a Printify
 * order (e.g. a missed/failed webhook), and optionally fulfill them.
 *
 *   GET /api/shop/reconcile            → report only (lists gaps)
 *   GET /api/shop/reconcile?fix=1      → fulfill each gap (idempotent)
 *   GET /api/shop/reconcile?days=30    → look back N days (default 14, max 90)
 *
 * Protected by CRON_SECRET so it can be scheduled (Vercel cron) or run by hand:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/shop/reconcile
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 14, 1), 90);
  const fix = url.searchParams.get("fix") === "1";
  const sinceSec = Math.floor((Date.now() - days * 86400 * 1000) / 1000);

  // 1. Collect paid, non-donation shop sessions from Stripe (paginated).
  const paid: PaidShopSession[] = [];
  let startingAfter: string | undefined;
  for (let page = 0; page < 10; page++) {
    const batch = await stripe.checkout.sessions.list({
      created: { gte: sinceSec },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const s of batch.data) {
      if (s.payment_status !== "paid") continue;
      if (s.metadata?.type === "donation") continue;
      if (!s.metadata?.line_items) continue;

      let lineItems: ShopLineItem[] = [];
      let shipping: Partial<PrintifyAddress> & { email?: string } = {};
      try {
        lineItems = JSON.parse(s.metadata.line_items);
      } catch {
        continue;
      }
      try {
        shipping = JSON.parse(s.metadata.shipping || "{}");
      } catch {
        shipping = {};
      }
      if (!Array.isArray(lineItems) || lineItems.length === 0) continue;

      paid.push({
        id: s.id,
        lineItems,
        shipping,
        email: shipping.email || s.customer_email || "",
        amountCents: s.amount_total,
        created: s.created,
      });
    }

    if (!batch.has_more) break;
    startingAfter = batch.data[batch.data.length - 1]?.id;
  }

  // 2. Cross-check each against the ORDERS audit trail.
  const db = getDb();
  const gaps: PaidShopSession[] = [];
  for (const ps of paid) {
    const existing = await db
      .collection(COLLECTIONS.ORDERS)
      .where("stripeSessionId", "==", ps.id)
      .limit(1)
      .get();
    if (existing.empty) gaps.push(ps);
  }

  const summary = (g: PaidShopSession) => ({
    sessionId: g.id,
    email: g.email,
    amountCents: g.amountCents,
    createdAt: new Date(g.created * 1000).toISOString(),
    lineItems: g.lineItems,
  });

  // 3. Report-only by default; fulfill when ?fix=1.
  if (!fix) {
    return NextResponse.json({
      mode: "report",
      windowDays: days,
      paidShopSessions: paid.length,
      unfulfilled: gaps.length,
      gaps: gaps.map(summary),
    });
  }

  const results = [];
  for (const g of gaps) {
    try {
      const r = await fulfillShopOrder({
        sessionId: g.id,
        lineItems: g.lineItems,
        shipping: g.shipping,
        customerEmail: g.email,
        amountTotalCents: g.amountCents,
      });
      results.push({ sessionId: g.id, ...r });
    } catch (err) {
      results.push({
        sessionId: g.id,
        status: "error" as const,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    mode: "fix",
    windowDays: days,
    attempted: gaps.length,
    results,
  });
}
