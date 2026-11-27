import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { requireOnboardedClient } from "@/lib/client/require-onboarded";
import { respondToReviewReconsideration } from "@/lib/reviews/reconsideration";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }
  const onboarded = await requireOnboardedClient(authResult.userId);
  if (!onboarded.ok) {
    return NextResponse.json({ error: onboarded.error }, { status: 403 });
  }

  let body: {
    decision?: unknown;
    rating?: unknown;
    comment?: unknown;
    note?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (body.decision !== "keep" && body.decision !== "update") {
    return NextResponse.json(
      { error: "decision must be 'keep' or 'update'." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const result = await respondToReviewReconsideration(onboarded.profile.id, id, {
    decision: body.decision,
    rating: typeof body.rating === "number" ? body.rating : undefined,
    comment:
      typeof body.comment === "string"
        ? body.comment
        : body.comment === null
          ? null
          : undefined,
    note: typeof body.note === "string" ? body.note : null,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ request: result.request });
}
