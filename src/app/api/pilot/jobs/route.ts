import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { listOpenJobsForPilot } from "@/lib/applications/application";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";

export async function GET() {
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

  const jobs = await listOpenJobsForPilot(eligible.profile.id);
  return NextResponse.json({ jobs });
}
