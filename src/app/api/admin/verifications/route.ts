import { NextResponse } from "next/server";
import {
  isValidVerificationFilter,
  listVerificationsForAdmin,
} from "@/lib/verification/verification";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";

export async function GET(request: Request) {
  const authResult = await requireAdminModuleView("certificates");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending";

  if (!isValidVerificationFilter(status)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const verifications = await listVerificationsForAdmin(status);
  return NextResponse.json({ verifications });
}
