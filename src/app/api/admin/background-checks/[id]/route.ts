import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import { isAdminSettableStatus } from "@/lib/background-check/rules";
import {
  adminUpdateBackgroundCheck,
  type AdminBackgroundCheckUpdate,
} from "@/lib/background-check/service";

type RouteContext = { params: Promise<{ id: string }> };

function optionalText(value: unknown, max: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("users", "edit");
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const update: AdminBackgroundCheckUpdate = {};
  if (body.status !== undefined) {
    if (!isAdminSettableStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    update.status = body.status;
  }
  const notes = optionalText(body.adminNotes, 2000);
  if (notes !== undefined) update.adminNotes = notes;
  const cert = optionalText(body.faaCertificateNumber, 64);
  if (cert !== undefined) update.faaCertificateNumber = cert;
  if (body.faaVerified === true) update.faaVerified = true;

  const { id } = await context.params;
  const result = await adminUpdateBackgroundCheck(id, authResult.userId, update);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ check: result.row });
}
