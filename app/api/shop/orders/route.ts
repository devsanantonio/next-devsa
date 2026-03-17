import { NextResponse } from "next/server";
import { submitOrder } from "@/lib/printify";
import type { PrintifyAddress } from "@/lib/printify";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.external_id || !body.line_items || !body.address_to) {
      return NextResponse.json(
        { error: "external_id, line_items, and address_to are required" },
        { status: 400 }
      );
    }

    const order = await submitOrder({
      external_id: body.external_id,
      label: body.label,
      line_items: body.line_items,
      shipping_method: body.shipping_method ?? 1,
      send_shipping_notification: body.send_shipping_notification ?? true,
      address_to: body.address_to as PrintifyAddress,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to submit order:", error);
    return NextResponse.json(
      { error: "Failed to submit order" },
      { status: 500 }
    );
  }
}
