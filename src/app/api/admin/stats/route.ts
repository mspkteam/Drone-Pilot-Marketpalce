import { NextResponse } from "next/server";
import { getAdminOverviewStats } from "@/lib/admin/stats";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const stats = await getAdminOverviewStats();
  return NextResponse.json({ stats });
}
