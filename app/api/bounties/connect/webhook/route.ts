import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { syncAccountFromStripe, clearConnectAccountByStripeId } from "@/lib/stripe-connect";
import type Stripe from "stripe";

// Stripe webhook for Connect account lifecycle. Configure a separate Stripe
// webhook endpoint pointed at this route and set STRIPE_CONNECT_WEBHOOK_SECRET.
// Events to subscribe to:
//   - account.updated                    (onboarding progress, capability changes)
//   - account.application.deauthorized   (user unlinked their Express account)
//
// This is a CONNECT webhook (events delivered with Stripe-Account header for
// the connected account). Use a separate webhook secret from the platform's
// own /api/shop/webhook so secrets don't collide.

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_CONNECT_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Connect webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const uid = await syncAccountFromStripe(account);
        if (!uid) {
          console.warn(`account.updated for unknown account ${account.id}`);
        }
        break;
      }
      case "account.application.deauthorized": {
        // The `account` field on the event identifies which connected account
        // was deauthorized. Clear our local Connect state so the next
        // onboarding attempt creates a fresh account.
        const accountId = (event.account as string | undefined) || (event.data.object as { id?: string }).id;
        if (accountId) {
          await clearConnectAccountByStripeId(accountId);
        }
        break;
      }
      default:
        // Ignore other event types — only subscribe to ones we care about.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Connect webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
