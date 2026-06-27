import { NextResponse } from "next/server";
import { getAdminShopEngineData } from "@/lib/admin/shop-engine";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("shop");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const data = await getAdminShopEngineData();
  return NextResponse.json(data);
}
