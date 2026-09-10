import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { reviseApplication } from "@/lib/applications/application";
import { requirePilotEligibleToBid } from "@/lib/pilot/require-bidding";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const proposedAmount = Number(body.proposedAmount);
  if (!Number.isFinite(proposedAmount) || proposedAmount <= 0) {
    return NextResponse.json(
      { error: "Enter a valid proposed amount." },
      { status: 400 },
    );
  }

  const message =
    typeof body.message === "string"
      ? body.message
      : body.message === null
        ? null
        : undefined;
  const estimatedDeliveryDate =
    typeof body.estimatedDeliveryDate === "string"
      ? body.estimatedDeliveryDate
      : body.estimatedDeliveryDate === null
        ? null
        : undefined;

  const { id } = await context.params;
  const result = await reviseApplication(id, eligible.profile.id, {
    proposedAmount,
    message,
    estimatedDeliveryDate,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ application: result.application });
}
