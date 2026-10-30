import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import { clearVerificationDocument } from "@/lib/verification/verification";

type RouteContext = { params: Promise<{ id: string }> };

/** DELETE /api/pilot/verifications/[id] — remove a non-approved upload. */
export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Verification id is required." }, { status: 400 });
  }

  const result = await clearVerificationDocument(id, profile.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
