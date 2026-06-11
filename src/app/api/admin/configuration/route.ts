import { NextResponse } from "next/server";
import { getAdminConfigurationData } from "@/lib/admin/configuration-data";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

export async function GET() {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  return NextResponse.json(getAdminConfigurationData());
}
