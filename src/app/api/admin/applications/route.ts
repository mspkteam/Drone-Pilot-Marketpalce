import { NextResponse } from "next/server";
import { listApplicationsForAdmin } from "@/lib/admin/applications";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET() {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const applications = await listApplicationsForAdmin();
  return NextResponse.json({ applications });
}
