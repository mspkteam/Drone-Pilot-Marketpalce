import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  getBookingForPilot,
  updateBookingStatus,
} from "@/lib/bookings/booking";
import { canTransitionBooking } from "@/lib/bookings/status";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const eligible = await requirePilotEligibleToBid(authResult.userId);
  if (!eligible.ok) {
    return NextResponse.json({ error: eligible.error }, { status: eligible.status });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const status = body.status as BookingStatus;

    if (!BOOKING_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
    }

    const existing = await getBookingForPilot(id, eligible.profile.id);
    if (!existing) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (!canTransitionBooking("pilot", existing.status, status)) {
      return NextResponse.json(
        { error: "That status change is not allowed." },
        { status: 400 },
      );
    }

    const result = await updateBookingStatus(id, status, {
      pilotProfileId: eligible.profile.id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ booking: result.booking });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
