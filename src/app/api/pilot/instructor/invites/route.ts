import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  listPendingStudentInvites,
  respondToInstructorStudentInvite,
} from "@/lib/instructor/students";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

/** Student: list pending instructor invites. */
export async function GET() {
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

  const invites = await listPendingStudentInvites(profile.id);
  return NextResponse.json({ invites });
}

/** Student: accept or decline an instructor invite. */
export async function PATCH(request: Request) {
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
      inviteId?: string;
      action?: "accept" | "decline";
    };
    if (!body.inviteId || (body.action !== "accept" && body.action !== "decline")) {
      return NextResponse.json(
        { error: "inviteId and action (accept|decline) are required." },
        { status: 400 },
      );
    }

    const result = await respondToInstructorStudentInvite(
      profile.id,
      body.inviteId,
      body.action,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ invite: result.invite });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
