import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import { submitDraftVerificationsForReview } from "@/lib/verification/verification";

export async function POST() {
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
      { error: "Complete your pilot profile first." },
      { status: 400 },
    );
  }

  const result = await submitDraftVerificationsForReview(profile.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    count: result.count,
    verifications: result.verifications,
  });
}
