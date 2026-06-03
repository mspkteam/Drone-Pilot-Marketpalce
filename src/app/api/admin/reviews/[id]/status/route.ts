import { NextResponse } from "next/server";
import { updateReviewStatusForAdmin } from "@/lib/admin/reviews";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { REVIEW_STATUSES, type ReviewStatus } from "@/types/review";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const body = (await request.json()) as { status?: string };
  const status = body.status;

  if (!status || !REVIEW_STATUSES.includes(status as ReviewStatus)) {
    return NextResponse.json({ error: "Invalid review status." }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await updateReviewStatusForAdmin(id, status as ReviewStatus);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true });
}
