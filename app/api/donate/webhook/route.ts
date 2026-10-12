import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { resend, EMAIL_FROM, isResendConfigured } from "@/lib/resend";
import { DonationThankYouEmail } from "@/lib/emails/donation-thank-you";

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
    }
  }

  return NextResponse.json({ received: true });
}
