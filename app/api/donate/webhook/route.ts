import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { resend, EMAIL_FROM, EMAIL_REPLY_TO, isResendConfigured } from "@/lib/resend";
import { CAMPAIGNS, toCampaignKey } from "@/lib/campaigns";
import { DonationThankYouEmail, getDonationThankYouSubject } from "@/lib/emails/donation-thank-you";

/**
 * Stripe webhook: sends the donation thank-you email.
 *
 * This lived at /api/shop/webhook, which also fulfilled shop orders through
 * Printify. The shop was removed on 2026-10-12 and donations are all that is
 * left.
 *
 * Stripe does not follow redirects, so the endpoint must use the canonical
 * host: https://www.devsa.community/api/donate/webhook
 */
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

      // Only keys in lib/campaigns.ts count, as at checkout.
      const campaignKey = toCampaignKey(session.metadata.campaign);
      const campaign = campaignKey ? CAMPAIGNS[campaignKey] : undefined;

      if (donorEmail && isResendConfigured() && resend) {
        try {
          await resend.emails.send({
            from: EMAIL_FROM,
            replyTo: EMAIL_REPLY_TO,
            to: donorEmail,
            subject: getDonationThankYouSubject(campaign?.name),
            html: DonationThankYouEmail({
              name: donorName,
              amount: amountDollars,
              date: new Date(session.created * 1000),
              campaign,
            }),
          });
        } catch (emailErr) {
          console.error("Failed to send donation thank-you email:", emailErr);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
