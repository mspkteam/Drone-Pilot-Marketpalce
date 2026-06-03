import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { listBookingsForClient } from "@/lib/bookings/booking";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";

export async function GET() {
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

  const bookings = await listBookingsForClient(onboarded.profile.id);
  return NextResponse.json({ bookings });
}
