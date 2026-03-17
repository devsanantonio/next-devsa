import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 10 checkout attempts per minute per IP
  const ip = getClientIp(request);
  const limit = rateLimit(ip, 10, 60 * 1000);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    if (!body.shipping) {
      return NextResponse.json(
        { error: "shipping address is required" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "";

    const line_items = body.items.map(
      (item: {
        title: string;
        variantTitle: string;
        price: number;
        quantity: number;
        image?: string;
      }) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            description: item.variantTitle || undefined,
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })
    );

    // Store shipping + cart info in metadata so we can create the Printify order after payment
    const metadata: Record<string, string> = {
      shipping: JSON.stringify(body.shipping),
      line_items: JSON.stringify(
        body.items.map(
          (item: {
            productId: string;
            variantId: number;
            quantity: number;
          }) => ({
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity,
          })
        )
      ),
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata,
      customer_email: body.shipping.email || undefined,
      success_url: `${origin}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
