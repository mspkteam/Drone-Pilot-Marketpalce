import { NextResponse } from "next/server";
import {
  castSquadronVote,
  closeSquadronBallot,
  closeSquadronBallotEarly,
  getSquadronVotingDashboard,
  openSquadronBallot,
} from "@/lib/admin/squadron-voting";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("disputes");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const dashboard = await getSquadronVotingDashboard(authResult.userId);
  return NextResponse.json(dashboard);
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("disputes", "recommend");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const action = body.action as string;

  if (action === "open") {
    if (!body.disputeId) {
      return NextResponse.json({ error: "disputeId is required." }, { status: 400 });
    }
    const result = await openSquadronBallot(body.disputeId, authResult.userId);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }
    return NextResponse.json({ ballot: result.ballot }, { status: 201 });
  }

  if (action === "vote") {
    if (!body.ballotId || !body.vote) {
      return NextResponse.json(
        { error: "ballotId and vote are required." },
        { status: 400 },
      );
    }
    const result = await castSquadronVote(
      body.ballotId,
      authResult.userId,
      body.vote,
      body.comment,
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }
    return NextResponse.json({ ballot: result.ballot });
  }

  if (action === "close") {
    if (!body.ballotId) {
      return NextResponse.json({ error: "ballotId is required." }, { status: 400 });
    }

    const result =
      typeof body.recommendation === "string" && body.recommendation.trim()
        ? await closeSquadronBallot(
            body.ballotId,
            body.recommendation.trim(),
            authResult.userId,
          )
        : await closeSquadronBallotEarly(body.ballotId, authResult.userId);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }
    return NextResponse.json({ ballot: result.ballot });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
