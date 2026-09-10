import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import {
  listReviewResetRequestsForAdmin,
  listReviewsForAdmin,
} from "@/lib/reviews/review-reset";

export async function GET(request: Request) {
  const authResult = await requireAdminPermission("users", "view");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("resetStatus") ?? "pending") as
    | "pending"
    | "approved"
    | "rejected"
    | "all";
  const reviewStatus = searchParams.get("status") ?? undefined;
  const belowFive = searchParams.get("belowFive") === "1";

  const [resetRequests, reviews] = await Promise.all([
    listReviewResetRequestsForAdmin(status),
    listReviewsForAdmin({
      status: reviewStatus || undefined,
      ratingMax: belowFive ? 4 : undefined,
    }),
  ]);

  return NextResponse.json({ resetRequests, reviews });
}
