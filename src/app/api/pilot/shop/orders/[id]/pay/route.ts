import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { payUniformOrder } from "@/lib/shop/shop";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createUniformOrderCheckout } from "@/lib/stripe/checkout";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  if (isStripeConfigured()) {
    const checkout = await createUniformOrderCheckout({
      userId: authResult.userId,
      orderId: id,
      request,
    });
    if (!checkout.ok) {
      return NextResponse.json({ error: checkout.error }, { status: checkout.status });
    }
    return NextResponse.json({ checkoutUrl: checkout.url });
  }

  const result = await payUniformOrder(id, authResult.userId);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ order: result.order });
}
