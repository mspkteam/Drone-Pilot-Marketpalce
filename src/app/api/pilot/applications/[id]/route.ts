import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getApplicationForPilot } from "@/lib/applications/application";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
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
  const application = await getApplicationForPilot(id, eligible.profile.id);

  if (!application) {
    return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  }

  return NextResponse.json({ application });
}
