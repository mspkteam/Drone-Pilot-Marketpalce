import { NextResponse } from "next/server";
import { getAdminPermissionsEngineData } from "@/lib/admin/permissions-engine";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

export async function GET(request: Request) {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const selectedUserId = searchParams.get("userId");

  const data = await getAdminPermissionsEngineData(selectedUserId);
  return NextResponse.json(data);
}
