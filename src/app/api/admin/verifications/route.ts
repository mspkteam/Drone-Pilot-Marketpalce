import { NextResponse } from "next/server";
import {
  isValidVerificationFilter,
  listVerificationsForAdmin,
} from "@/lib/verification/verification";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function GET(request: Request) {
  const authResult = await requireAdminSession();
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
