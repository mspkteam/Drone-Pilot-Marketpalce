import { NextResponse } from "next/server";
import { getSquadronBallotByDisputeId } from "@/lib/admin/squadron-voting";
import { getDisputeForAdmin } from "@/lib/disputes/dispute";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminModuleView("disputes");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const result = await getDisputeForAdmin(id, {
    userId: authResult.userId,
    role: authResult.role,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  const squadronBallot = await getSquadronBallotByDisputeId(
    result.dispute.id,
    authResult.userId,
  );

  return NextResponse.json({ dispute: result.dispute, squadronBallot });
}
