import { NextResponse } from "next/server";
import { isValidReviewFilter, listReviewsForAdmin } from "@/lib/admin/reviews";
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
  const status = searchParams.get("status") ?? "all";

  if (!isValidReviewFilter(status)) {
    return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
  }

  const reviews = await listReviewsForAdmin(status);
  return NextResponse.json({ reviews });
}
