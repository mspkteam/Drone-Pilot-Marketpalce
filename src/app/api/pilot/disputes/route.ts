import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { listDisputesForPilot } from "@/lib/disputes/dispute";
import { getPilotProfileByUserId, isOnboardingComplete } from "@/lib/pilot/profile";
import type { DisputeStatus } from "@/types/dispute";
import { DISPUTE_STATUSES } from "@/types/dispute";

function parseStatusFilter(
  value: string | null,
): DisputeStatus | "all" | undefined {
  if (!value || value === "all") return "all";
  if ((DISPUTE_STATUSES as readonly string[]).includes(value)) {
    return value as DisputeStatus;
  }
  return undefined;
}

export async function GET(request: Request) {
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

  const status = parseStatusFilter(
    new URL(request.url).searchParams.get("status"),
  );
  if (status === undefined) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const disputes = await listDisputesForPilot(profile.id, status);
  return NextResponse.json({ disputes });
}
