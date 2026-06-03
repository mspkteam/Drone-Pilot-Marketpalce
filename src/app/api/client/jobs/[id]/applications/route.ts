import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { listApplicationsForClientJob } from "@/lib/applications/client-offers";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const result = await listApplicationsForClientJob(id, onboarded.profile.id);

  if (!result) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
