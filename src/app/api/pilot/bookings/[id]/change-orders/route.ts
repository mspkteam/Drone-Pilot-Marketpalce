import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getBookingForPilot } from "@/lib/bookings/booking";
import { getChangeOrderSummary, proposeChangeOrder } from "@/lib/bookings/change-orders";
import { getPilotProfileByUserId, isOnboardingComplete } from "@/lib/pilot/profile";

type RouteContext = { params: Promise<{ id: string }> };

async function resolve(context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return { error: NextResponse.json({ error: authResult.error }, { status: authResult.status }) };
  }
  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return { error: NextResponse.json({ error: "Complete pilot onboarding first." }, { status: 403 }) };
  }
  const { id } = await context.params;
  const booking = await getBookingForPilot(id, profile.id);
  if (!booking) {
    return { error: NextResponse.json({ error: "Booking not found." }, { status: 404 }) };
  }
  return { userId: authResult.userId, profileId: profile.id, bookingId: id };
}

export async function GET(_request: Request, context: RouteContext) {
  const r = await resolve(context);
  if ("error" in r) return r.error;
  return NextResponse.json({ summary: await getChangeOrderSummary(r.bookingId) });
}

export async function POST(request: Request, context: RouteContext) {
  const r = await resolve(context);
  if ("error" in r) return r.error;

  const body = (await request.json().catch(() => null)) as {
    proposedAmount?: unknown;
    note?: unknown;
  } | null;
  const proposedAmount = Number(body?.proposedAmount);
  if (!Number.isFinite(proposedAmount)) {
    return NextResponse.json({ error: "proposedAmount is required." }, { status: 400 });
  }

  const result = await proposeChangeOrder({
    bookingId: r.bookingId,
    pilotProfileId: r.profileId,
    pilotUserId: r.userId,
    proposedAmount,
    note: typeof body?.note === "string" ? body.note : null,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ changeOrder: result.changeOrder }, { status: 201 });
}
