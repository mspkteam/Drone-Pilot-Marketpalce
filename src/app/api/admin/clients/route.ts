import { NextResponse } from "next/server";
import { listClientsForAdmin } from "@/lib/admin/clients";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const clients = await listClientsForAdmin();
  return NextResponse.json({ clients });
}
