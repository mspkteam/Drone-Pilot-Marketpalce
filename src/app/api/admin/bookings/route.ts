import { NextResponse } from "next/server";
import { isValidBookingFilter, listBookingsForAdmin } from "@/lib/admin/bookings";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";

  if (!isValidBookingFilter(status)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const bookings = await listBookingsForAdmin(status);
  return NextResponse.json({ bookings });
}
