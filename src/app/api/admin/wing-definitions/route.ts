import { NextResponse } from "next/server";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";
import {
  createWingDefinition,
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

  const definitions = await listWingDefinitionsForAdmin();
  return NextResponse.json({ definitions });
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission("badges", "create");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const result = await createWingDefinition({
    code: body.code,
    title: body.title ?? "",
    description: body.description ?? "",
    category: body.category ?? "milestone",
    iconLabel: body.iconLabel,
    imageUrl: body.imageUrl,
    autoRule: body.autoRule ?? "manual_only",
    ruleParam: body.ruleParam,
    threshold: body.threshold,
    sortOrder: body.sortOrder,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(
    { definition: result.definition },
    { status: 201 },
  );
}
