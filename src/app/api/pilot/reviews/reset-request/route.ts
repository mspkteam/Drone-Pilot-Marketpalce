import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import {
  getPilotReviewResetStatus,
  requestReviewReset,
} from "@/lib/reviews/review-reset";

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
    return NextResponse.json({ error: "Pilot profile not found." }, { status: 404 });
  }

  const status = await getPilotReviewResetStatus(profile.id);
  return NextResponse.json(status);
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
  if (!profile) {
    return NextResponse.json({ error: "Pilot profile not found." }, { status: 404 });
  }

  let note: string | null = null;
  try {
    const body = (await request.json()) as { note?: string };
    note = typeof body.note === "string" ? body.note : null;
  } catch {
    note = null;
  }

  const result = await requestReviewReset(profile.id, note);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ request: result.request });
}
