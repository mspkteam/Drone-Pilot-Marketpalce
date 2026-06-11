import { NextResponse } from "next/server";
import { listUsersForAdmin } from "@/lib/admin/users";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const users = await listUsersForAdmin();
  return NextResponse.json({ users });
}
