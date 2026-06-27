import { NextResponse } from "next/server";
import { rejectJobApplication } from "@/lib/applications/client-offers";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";

type RouteContext = {
  params: Promise<{ id: string; applicationId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const onboarded = await requireOnboardedClient(authResult.userId);
  if (!onboarded.ok) {
    return NextResponse.json({ error: onboarded.error }, { status: 403 });
  }

  const { id: jobId, applicationId } = await context.params;
  const result = await rejectJobApplication(
    jobId,
    applicationId,
    onboarded.profile.id,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
