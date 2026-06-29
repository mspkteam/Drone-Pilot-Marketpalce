import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/auth/require-client";
import { reviewDelivery } from "@/lib/deliveries/delivery";
import { getClientProfileByUserId } from "@/lib/client/profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireClientSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getClientProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Client profile not found." }, { status: 404 });
  }

  const { id: bookingId } = await context.params;

  try {
    const body = await request.json();
    const decision = body.decision === "reject" ? "reject" : "approve";
    const result = await reviewDelivery(bookingId, profile.id, {
      decision,
      feedback: typeof body.feedback === "string" ? body.feedback : undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ delivery: result.delivery });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
