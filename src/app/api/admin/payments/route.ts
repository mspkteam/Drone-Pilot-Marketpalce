import { NextResponse } from "next/server";
import { listPaymentsForAdmin } from "@/lib/admin/payments";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const payments = await listPaymentsForAdmin();
  return NextResponse.json({ payments });
}
