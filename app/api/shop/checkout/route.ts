import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { calculateShipping, getProduct } from "@/lib/printify";
import type { PrintifyAddress } from "@/lib/printify";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Used only if Printify's shipping API is unreachable, so we never undercharge
// to the point of a loss. Flagged in metadata so it can be reconciled.
const FALLBACK_SHIPPING_CENTS = 800;

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

    // Validate the shape of each cart item before trusting anything else.
    type CartItem = { productId: string; variantId: number; quantity: number };
    const items = body.items as CartItem[];
    for (const it of items) {
      if (
        !it ||
        typeof it.productId !== "string" ||
        typeof it.variantId !== "number" ||
        !Number.isInteger(it.quantity) ||
        it.quantity < 1 ||
        it.quantity > 100
      ) {
        return NextResponse.json(
          { error: "Invalid item in cart" },
          { status: 400 }
        );
      }
    }

    // Pull authoritative product data from Printify. Prices, titles, and images
    // come from the server — never from the client — so a tampered request
    // can't set its own price or buy a disabled/nonexistent variant.
    const uniqueIds = [...new Set(items.map((i) => i.productId))];
    let products;
    try {
      products = await Promise.all(uniqueIds.map((id) => getProduct(id)));
    } catch (err) {
      console.error("Failed to load products for checkout:", err);
      return NextResponse.json(
        { error: "Could not verify products" },
        { status: 502 }
      );
    }
    const productMap = new Map(products.map((p) => [p.id, p]));

    const validated: Array<{
      title: string;
      variantTitle: string;
      price: number;
      image?: string;
      quantity: number;
    }> = [];
    for (const it of items) {
      const product = productMap.get(it.productId);
      if (!product || !product.visible) {
        return NextResponse.json(
          { error: "A product in your cart is no longer available" },
          { status: 400 }
        );
      }
      const variant = product.variants.find((v) => v.id === it.variantId);
      if (!variant || !variant.is_enabled || !variant.is_available) {
        return NextResponse.json(
          { error: "A selected option is no longer available" },
          { status: 400 }
        );
      }
      const image =
        product.images.find(
          (img) => img.is_default && img.variant_ids.includes(it.variantId)
        )?.src ||
        product.images.find((img) => img.variant_ids.includes(it.variantId))
          ?.src ||
        product.images.find((img) => img.is_default)?.src ||
        product.images[0]?.src;
      validated.push({
        title: product.title,
        variantTitle: variant.title,
        price: variant.price,
        image,
        quantity: it.quantity,
      });
    }

    const line_items = validated.map((v) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: v.title,
          description: v.variantTitle || undefined,
          images: v.image ? [v.image] : undefined,
        },
        unit_amount: v.price,
      },
      quantity: v.quantity,
    }));

    const printifyLineItems = items.map((it) => ({
      product_id: it.productId,
      variant_id: it.variantId,
      quantity: it.quantity,
    }));

    // Charge the customer the same standard shipping Printify will bill us for
    // (the webhook submits orders with shipping_method: 1 = standard). Without
    // this, Stripe collects product price only and we eat Printify's shipping.
    let shippingCents = FALLBACK_SHIPPING_CENTS;
    let shippingEstimated = false;
    try {
      const rates = await calculateShipping({
        line_items: printifyLineItems,
        address_to: body.shipping as PrintifyAddress,
      });
      if (rates && typeof rates.standard === "number" && rates.standard >= 0) {
        shippingCents = rates.standard;
      } else {
        shippingEstimated = true;
      }
    } catch (err) {
      console.error("Shipping calculation failed, using fallback:", err);
      shippingEstimated = true;
    }

    // Store shipping + cart info in metadata so we can create the Printify order after payment
    const metadata: Record<string, string> = {
      shipping: JSON.stringify(body.shipping),
      line_items: JSON.stringify(printifyLineItems),
      shipping_cents: String(shippingCents),
      shipping_estimated: String(shippingEstimated),
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      metadata,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCents, currency: "usd" },
            display_name: "Standard shipping",
          },
        },
      ],
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
