import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import {
  getPilotWingRequestPage,
  savePilotWingRequest,
} from "@/lib/wings/aviator-wing-requests";

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

  const page = await getPilotWingRequestPage(profile.id, profile.displayName);
  return NextResponse.json(page);
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
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action === "submit" ? "submit" : "draft";
    const hoursRaw = body.totalHours;
    const totalHours =
      hoursRaw == null || hoursRaw === ""
        ? null
        : Number(hoursRaw);

    const result = await savePilotWingRequest(profile.id, {
      action,
      wingCode: typeof body.wingCode === "string" ? body.wingCode : "",
      legalName: typeof body.legalName === "string" ? body.legalName : "",
      ftn: typeof body.ftn === "string" ? body.ftn : "",
      totalHours: totalHours != null && Number.isFinite(totalHours) ? totalHours : null,
      notes: typeof body.notes === "string" ? body.notes : "",
      confirmation: body.confirmation === true,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ request: result.request });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
