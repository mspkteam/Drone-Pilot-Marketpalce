import { NextResponse } from "next/server";
import { isValidPilotFilter, listPilotsForAdmin } from "@/lib/admin/pilots";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET(request: Request) {
  const authResult = await requireAdminModuleView("users");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending_review";

  if (!isValidPilotFilter(status)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const pilots = await listPilotsForAdmin(status);
  return NextResponse.json({ pilots });
}
