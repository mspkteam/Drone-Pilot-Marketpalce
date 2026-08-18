import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { createStudentWingRequest } from "@/lib/instructor/wing-requests";
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
    const body = await request.json();
    const wingCode = typeof body.wingCode === "string" ? body.wingCode : "";
    const result = await createStudentWingRequest(profile.id, wingCode);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ request: result.request }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
