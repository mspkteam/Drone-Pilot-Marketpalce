import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getBookingForPilot } from "@/lib/bookings/booking";
import { getPaymentForBooking } from "@/lib/payments/payment";
import { getPilotProfileByUserId, isOnboardingComplete } from "@/lib/pilot/profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 403 },
    );
  }

  const { id } = await context.params;
  const booking = await getBookingForPilot(id, profile.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const payment = await getPaymentForBooking(id);
  return NextResponse.json({ payment });
}
