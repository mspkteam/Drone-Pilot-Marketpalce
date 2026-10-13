import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  inviteExistingPilotAsStudent,
  listInstructorOutgoingInvites,
  listInstructorStudents,
} from "@/lib/instructor/students";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

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
  if (!profile.instructorAddonActive) {
    return NextResponse.json(
      { error: "Activate Instructor Membership to manage students." },
      { status: 403 },
    );
  }

  const [students, invites] = await Promise.all([
    listInstructorStudents(profile.id),
    listInstructorOutgoingInvites(profile.id),
  ]);

  return NextResponse.json({ students, invites });
}

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
      query?: string;
      message?: string;
    };
    const result = await inviteExistingPilotAsStudent(
      profile.id,
      body.query ?? "",
      body.message,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ invite: result.invite }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
