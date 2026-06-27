import { NextResponse } from "next/server";
import {
  createOperatingRegion,
  deleteOperatingRegion,
  listOperatingRegions,
  updateOperatingRegion,
} from "@/lib/admin/regions";
import {
  requireAdminModuleView,
  requireAdminPermission,
} from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("configuration");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  return NextResponse.json({ regions: await listOperatingRegions() });
}

export async function POST(request: Request) {
  const authResult = await requireAdminPermission(
    "configuration",
    "manageSettings",
  );
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const result = await createOperatingRegion(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ region: result.region }, { status: 201 });
}

export async function PATCH(request: Request) {
  const authResult = await requireAdminPermission(
    "configuration",
    "manageSettings",
  );
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = await request.json();
  const { id, ...patch } = body as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "Region id is required." }, { status: 400 });
  }

  const result = await updateOperatingRegion(id, patch);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ region: result.region });
}

export async function DELETE(request: Request) {
  const authResult = await requireAdminPermission(
    "configuration",
    "manageSettings",
  );
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Region id is required." }, { status: 400 });
  }

  const result = await deleteOperatingRegion(id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
