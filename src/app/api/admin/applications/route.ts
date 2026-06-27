import { NextResponse } from "next/server";
import { listApplicationsForAdmin } from "@/lib/admin/applications";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET() {
  const authResult = await requireAdminModuleView("users");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const applications = await listApplicationsForAdmin();
  return NextResponse.json({ applications });
}
