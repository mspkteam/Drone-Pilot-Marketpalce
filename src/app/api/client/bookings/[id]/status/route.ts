import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import {
  getBookingForClient,
  updateBookingStatus,
} from "@/lib/bookings/booking";
import { canTransitionBooking } from "@/lib/bookings/status";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
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

  try {
    const body = await request.json();
    const status = body.status as BookingStatus;

    if (!BOOKING_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
    }

    const existing = await getBookingForClient(id, onboarded.profile.id);
    if (!existing) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (!canTransitionBooking("client", existing.status, status)) {
      return NextResponse.json(
        { error: "That status change is not allowed." },
        { status: 400 },
      );
    }

    const result = await updateBookingStatus(id, status, {
      clientProfileId: onboarded.profile.id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ booking: result.booking });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
