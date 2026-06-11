import { NextResponse } from "next/server";
import { getCmsOverview } from "@/lib/cms/cms-store";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

export async function GET() {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  return NextResponse.json(getCmsOverview());
}
