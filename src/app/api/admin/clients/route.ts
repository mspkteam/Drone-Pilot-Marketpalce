import { NextResponse } from "next/server";
import { listClientsForAdmin } from "@/lib/admin/clients";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("users");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const clients = await listClientsForAdmin();
  return NextResponse.json({ clients });
}
