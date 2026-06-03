import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";
import { listReviewsForPilotUser } from "@/lib/reviews/review";

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

  const reviews = await listReviewsForPilotUser(
    authResult.userId,
    eligible.profile.id,
  );
  return NextResponse.json({ reviews });
}
