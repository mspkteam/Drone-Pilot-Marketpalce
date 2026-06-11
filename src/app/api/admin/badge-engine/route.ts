import { NextResponse } from "next/server";
import { getAdminBadgeEngineData } from "@/lib/admin/badge-engine";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

export async function GET() {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const data = await getAdminBadgeEngineData();
  return NextResponse.json(data);
}
