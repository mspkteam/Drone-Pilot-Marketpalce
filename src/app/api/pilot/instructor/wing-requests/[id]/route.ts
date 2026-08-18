import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { reviewInstructorWingRequest } from "@/lib/instructor/wing-requests";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params;

  try {
    const body = await request.json();
    const action = body.action === "needs_info" ? "needs_info" : "award";
    const note = typeof body.note === "string" ? body.note : undefined;
    const result = await reviewInstructorWingRequest(
      profile.id,
      authResult.userId,
      id,
      action,
      note,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ request: result.request });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
