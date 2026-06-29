import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { getDeliveryForBooking } from "@/lib/deliveries/delivery";
import { getClientProfileByUserId } from "@/lib/client/profile";
import { getBookingForClient } from "@/lib/bookings/booking";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getClientProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Client profile not found." }, { status: 404 });
  }

  const { id: bookingId } = await context.params;
  const booking = await getBookingForClient(bookingId, profile.id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const delivery = await getDeliveryForBooking(bookingId);
  return NextResponse.json({ delivery });
}
