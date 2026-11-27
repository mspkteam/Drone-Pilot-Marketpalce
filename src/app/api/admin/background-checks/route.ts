import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import { listAdminBackgroundChecks } from "@/lib/background-check/service";

export async function GET() {
  const authResult = await requireAdminPermission("users", "view");
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  return NextResponse.json({ checks: await listAdminBackgroundChecks() });
}
