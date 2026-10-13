import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { awardWingToStudentDirect } from "@/lib/instructor/students";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      studentProfileId?: string;
      wingCode?: string;
    };
    if (!body.studentProfileId || !body.wingCode) {
      return NextResponse.json(
        { error: "studentProfileId and wingCode are required." },
        { status: 400 },
      );
    }

    const result = await awardWingToStudentDirect(
      profile.id,
      authResult.userId,
      body.studentProfileId,
      body.wingCode,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      wingCode: result.wingCode,
      wingLabel: result.wingLabel,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
