import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { submitDeliveryForReview } from "@/lib/deliveries/delivery";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return NextResponse.json({ error: "Pilot profile not found." }, { status: 404 });
  }

  const { id: bookingId } = await context.params;
  const result = await submitDeliveryForReview(bookingId, profile.id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ delivery: result.delivery });
}
