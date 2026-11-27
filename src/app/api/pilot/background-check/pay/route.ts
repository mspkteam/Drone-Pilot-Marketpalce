import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { payBackgroundCheckDemo } from "@/lib/background-check/service";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createBackgroundCheckCheckout } from "@/lib/stripe/checkout";

/** Demo pay stub until Stripe — marks the background check Paid. */
export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  let body: { consent?: unknown } = {};
  try {
    body = (await request.json()) as { consent?: unknown };
  } catch {
    body = {};
  }

  if (isStripeConfigured()) {
    const checkout = await createBackgroundCheckCheckout({
      userId: authResult.userId,
      consent: body.consent === true,
      request,
    });
    if (!checkout.ok) {
      return NextResponse.json({ error: checkout.error }, { status: checkout.status });
    }
    return NextResponse.json({ checkoutUrl: checkout.url });
  }

  const result = await payBackgroundCheckDemo(authResult.userId, body.consent === true);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ check: result.check });
}
