import { NextResponse } from "next/server";
import { requireAdminModuleView } from "@/lib/auth/require-admin-permission";
import { updateReviewForAdmin } from "@/lib/reviews/review-reset";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAdminModuleView("users");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  let body: { status?: "published" | "hidden" | "flagged"; rating?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await updateReviewForAdmin(id, {
    status: body.status,
    rating: body.rating,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ review: result.review });
}
