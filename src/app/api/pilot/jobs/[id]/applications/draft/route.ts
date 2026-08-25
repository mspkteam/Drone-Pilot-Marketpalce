import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { saveJobApplicationDraft } from "@/lib/applications/application";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const eligible = await requirePilotEligibleToBid(authResult.userId);
  if (!eligible.ok) {
    return NextResponse.json({ error: eligible.error }, { status: eligible.status });
  }

  const { id: jobId } = await context.params;

  try {
    const body = (await request.json()) as {
      proposedAmount?: number | string;
      message?: string | null;
      estimatedDeliveryDate?: string | null;
      currency?: string;
      draftForm?: Record<string, unknown>;
    };

    const amount =
      typeof body.proposedAmount === "number"
        ? body.proposedAmount
        : Number(body.proposedAmount);

    const result = await saveJobApplicationDraft(jobId, eligible.profile.id, {
      proposedAmount: Number.isFinite(amount) ? amount : 0,
      message: body.message ?? null,
      estimatedDeliveryDate: body.estimatedDeliveryDate ?? null,
      currency: body.currency,
      draftForm: body.draftForm && typeof body.draftForm === "object" ? body.draftForm : {},
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ application: result.application });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
