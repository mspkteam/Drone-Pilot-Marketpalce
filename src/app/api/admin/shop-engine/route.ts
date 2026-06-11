import { NextResponse } from "next/server";
import { getAdminShopEngineData } from "@/lib/admin/shop-engine";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const data = await getAdminShopEngineData();
  return NextResponse.json(data);
}
