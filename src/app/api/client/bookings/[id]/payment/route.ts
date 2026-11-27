import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { getBookingForClient } from "@/lib/bookings/booking";
import { getPaymentForBooking } from "@/lib/payments/payment";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createEscrowCheckout } from "@/lib/stripe/escrow";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const onboarded = await requireOnboardedClient(authResult.userId);
  if (!onboarded.ok) {
    return NextResponse.json({ error: onboarded.error }, { status: 403 });
  }

  const { id } = await context.params;
  const booking = await getBookingForClient(id, onboarded.profile.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const payment = await getPaymentForBooking(id);
  return NextResponse.json({ payment });
}

/** Start Stripe Checkout to fund the booking escrow (job amount + 6% service fee). */
export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const onboarded = await requireOnboardedClient(authResult.userId);
  if (!onboarded.ok) {
    return NextResponse.json({ error: onboarded.error }, { status: 403 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const { id } = await context.params;
  const booking = await getBookingForClient(id, onboarded.profile.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const checkout = await createEscrowCheckout(id, authResult.userId, request);
  if (!checkout.ok) {
    return NextResponse.json({ error: checkout.error }, { status: checkout.status });
  }
  return NextResponse.json({ checkoutUrl: checkout.url });
}
