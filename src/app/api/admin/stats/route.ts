import { NextResponse } from "next/server";
import { getAdminOverviewStats } from "@/lib/admin/stats";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("dashboard");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const stats = await getAdminOverviewStats();
  return NextResponse.json({ stats });
}
