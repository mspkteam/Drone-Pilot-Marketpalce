import { NextResponse } from "next/server";
import { revokeCertificateFromPilot } from "@/lib/certificates/certificate";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("certificates", "issue");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { id } = await context.params;
  const result = await revokeCertificateFromPilot(id);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true });
}
