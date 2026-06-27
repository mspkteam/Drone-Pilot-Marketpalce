import { NextResponse } from "next/server";
import { listUsersForAdmin } from "@/lib/admin/users";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("users");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const users = await listUsersForAdmin();
  return NextResponse.json({ users });
}
