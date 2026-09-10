import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth/require-admin-permission";
import { resolveReviewResetRequest } from "@/lib/reviews/review-reset";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAdminPermission("users", "edit");
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  let body: { decision?: "approve" | "reject"; note?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.decision !== "approve" && body.decision !== "reject") {
    return NextResponse.json(
      { error: "Decision must be approve or reject." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const result = await resolveReviewResetRequest(
    id,
    authResult.userId,
    body.decision,
    body.note,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    request: result.request,
    hiddenCount: result.hiddenCount,
  });
}
