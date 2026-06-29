import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  listOpenJobsForPilot,
  type PilotJobsQueryFilters,
} from "@/lib/applications/application";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function parseFilters(searchParams: URLSearchParams): PilotJobsQueryFilters {
  return {
    q: searchParams.get("q")?.trim() || undefined,
    category: searchParams.get("category")?.trim() || undefined,
    budgetMin: parseOptionalNumber(searchParams.get("budgetMin")),
    budgetMax: parseOptionalNumber(searchParams.get("budgetMax")),
  };
}

export async function GET(request: Request) {
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

  const filters = parseFilters(new URL(request.url).searchParams);
  const result = await listOpenJobsForPilot(eligible.profile.id, filters);
  return NextResponse.json(result);
}
