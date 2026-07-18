import { NextResponse } from "next/server";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";
import {
  grantWingToPilot,
  listPilotsForWingAssign,
  listRecentPilotWingsForAdmin,
  listWingDefinitionsForAdmin,
} from "@/lib/wings/wings";

export async function GET() {
  const authResult = await requireAdminModuleView("badges");
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
  const authResult = await requireAdminPermission("badges", "assign");
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

  const note = typeof body.note === "string" ? body.note.trim() : "";
  const result = await grantWingToPilot(
    body.pilotProfileId,
    body.wingDefinitionId,
    {
      source: "manual",
      assignedByUserId: authResult.userId,
      metadata: note ? { note } : null,
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
