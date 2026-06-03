import { NextResponse } from "next/server";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";
import {
  grantWingToPilot,
  listPilotsForWingAssign,
  listRecentPilotWingsForAdmin,
  listWingDefinitionsForAdmin,
} from "@/lib/wings/wings";

export async function GET() {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const [recentAwards, definitions, pilots] = await Promise.all([
    listRecentPilotWingsForAdmin(),
    listWingDefinitionsForAdmin(),
    listPilotsForWingAssign(),
  ]);

  return NextResponse.json({ recentAwards, definitions, pilots });
}

export async function POST(request: Request) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  if (!body.pilotProfileId || !body.wingDefinitionId) {
    return NextResponse.json(
      { error: "pilotProfileId and wingDefinitionId are required." },
      { status: 400 },
    );
  }

  const result = await grantWingToPilot(
    body.pilotProfileId,
    body.wingDefinitionId,
    {
      source: "manual",
      assignedByUserId: authResult.userId,
    },
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { wing: result.wing, created: result.created },
    { status: result.created ? 201 : 200 },
  );
}
