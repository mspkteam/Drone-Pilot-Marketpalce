import { NextResponse } from "next/server";
import { getAdminCommissionsData } from "@/lib/admin/commission-ledger";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const data = await getAdminCommissionsData();
  return NextResponse.json(data);
}
