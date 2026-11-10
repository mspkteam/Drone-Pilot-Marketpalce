import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  castPilotSquadronVote,
  getPilotSquadronEvidence,
  getPilotSquadronVotingDashboard,
} from "@/lib/pilot/squadron-voting";
import type { SquadronVote } from "@/lib/admin/squadron-voting";

const VALID_VOTES = new Set<SquadronVote["vote"]>([
  "approve",
  "reject",
  "abstain",
]);

export async function GET(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const evidenceBallotId = searchParams.get("evidence");
  if (evidenceBallotId) {
    const result = await getPilotSquadronEvidence(
      authResult.userId,
      evidenceBallotId,
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ evidence: result.evidence });
  }

  const dashboard = await getPilotSquadronVotingDashboard(authResult.userId);
  return NextResponse.json(dashboard);
}

export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  try {
    const body = (await request.json()) as {
      action?: string;
      ballotId?: string;
      vote?: SquadronVote["vote"];
      comment?: string;
    };

    if (body.action !== "vote") {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
    if (!body.ballotId || !body.vote || !VALID_VOTES.has(body.vote)) {
      return NextResponse.json(
        { error: "ballotId and a valid vote are required." },
        { status: 400 },
      );
    }

    const result = await castPilotSquadronVote(
      authResult.userId,
      body.ballotId,
      body.vote,
      typeof body.comment === "string" ? body.comment : undefined,
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }
    return NextResponse.json({ ballot: result.ballot });
  } catch {
    return NextResponse.json(
      { error: "Failed to cast squadron vote." },
      { status: 500 },
    );
  }
}
