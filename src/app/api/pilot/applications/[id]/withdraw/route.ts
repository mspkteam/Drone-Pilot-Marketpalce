import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { withdrawApplication } from "@/lib/applications/application";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const eligible = await requirePilotEligibleToBid(authResult.userId);
  if (!eligible.ok) {
    return NextResponse.json({ error: eligible.error }, { status: eligible.status });
  }

  const { id } = await context.params;
  const result = await withdrawApplication(id, eligible.profile.id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ application: result.application });
}
