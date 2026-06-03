import { NextResponse } from "next/server";
import { updateBookingStatusForAdmin } from "@/lib/admin/bookings";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { BOOKING_STATUSES, type BookingStatus } from "@/types/booking";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = (await request.json()) as { status?: string };
  const status = body.status;

  if (!status || !BOOKING_STATUSES.includes(status as BookingStatus)) {
    return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await updateBookingStatusForAdmin(id, status as BookingStatus);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ booking: result.booking });
}
