import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import { listReviewsForPilotUser } from "@/lib/reviews/review";

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json(
      { error: "Pilot profile not found." },
      { status: 404 },
    );
  }

  const reviews = await listReviewsForPilotUser(authResult.userId, profile.id);
  return NextResponse.json({ reviews });
}
