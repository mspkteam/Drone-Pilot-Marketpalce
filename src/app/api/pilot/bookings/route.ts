import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { listBookingsForPilot } from "@/lib/bookings/booking";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";

export async function GET() {
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

  const bookings = await listBookingsForPilot(eligible.profile.id);
  return NextResponse.json({ bookings });
}
