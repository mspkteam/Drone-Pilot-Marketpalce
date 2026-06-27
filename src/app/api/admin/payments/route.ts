import { NextResponse } from "next/server";
import { getAdminCommissionsData } from "@/lib/admin/commission-ledger";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("commissions");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const data = await getAdminCommissionsData();
  return NextResponse.json(data);
}
