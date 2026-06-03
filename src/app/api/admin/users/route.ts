import { NextResponse } from "next/server";
import { listUsersForAdmin } from "@/lib/admin/users";
import { requireSuperAdminSession } from "@/lib/auth/require-super-admin";

export async function GET() {
  const authResult = await requireSuperAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const users = await listUsersForAdmin();
  return NextResponse.json({ users });
}
