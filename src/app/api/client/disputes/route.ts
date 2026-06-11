import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { listDisputesForClient } from "@/lib/disputes/dispute";
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

  const status = parseStatusFilter(
    new URL(request.url).searchParams.get("status"),
  );
  if (status === undefined) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const disputes = await listDisputesForClient(onboarded.profile.id, status);
  return NextResponse.json({ disputes });
}
