import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip, 5, 60 * 1000);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  try {
    const body = await request.json();

    const amount = Number(body.amount);
    if (!amount || !Number.isFinite(amount) || amount < 5 || amount > 10000) {
      return NextResponse.json(
        { error: "Amount must be between $5 and $10,000" },
        { status: 400 }
      );
    }

    const email =
      typeof body.email === "string" ? body.email.trim() : undefined;
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined;

    const origin = request.headers.get("origin") || "";
    const unitAmount = Math.round(amount * 100); // cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "DEVSA Donation",
              description: `Support DEVSA — 501(c)(3) Education Nonprofit`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "donation",
        donor_name: name || "",
        donor_email: email || "",
      },
      customer_email: email || undefined,
      success_url: `${origin}/buildingtogether?donated=true`,
      cancel_url: `${origin}/buildingtogether`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create donation session:", error);
    return NextResponse.json(
      { error: "Failed to create donation session" },
      { status: 500 }
    );
  }
}
