import { NextResponse } from "next/server";
import { calculateShipping } from "@/lib/printify";
import type { PrintifyAddress } from "@/lib/printify";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 20 shipping calculations per minute per IP
  const ip = getClientIp(request);
  const limit = rateLimit(ip, 20, 60 * 1000);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  try {
    const body = await request.json();

    if (!body.line_items || !body.address_to) {
      return NextResponse.json(
        { error: "line_items and address_to are required" },
        { status: 400 }
      );
    }

    const shippingCost = await calculateShipping({
      line_items: body.line_items,
      address_to: body.address_to as PrintifyAddress,
    });

    return NextResponse.json(shippingCost);
  } catch (error) {
    console.error("Failed to calculate shipping:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping" },
      { status: 500 }
    );
  }
}
