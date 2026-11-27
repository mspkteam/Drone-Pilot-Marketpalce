import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import {
  listReconsiderationsForPilot,
  requestReviewReconsideration,
} from "@/lib/reviews/reconsideration";

async function resolvePilot() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return {
      error: NextResponse.json(
        { error: authResult.error },
        { status: authResult.status },
      ),
    };
  }
  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile) {
    return {
      error: NextResponse.json({ error: "Pilot profile not found." }, { status: 404 }),
    };
  }
  return { profile };
}

export async function GET() {
  const r = await resolvePilot();
  if (r.error) return r.error;
  const requests = await listReconsiderationsForPilot(r.profile.id);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const r = await resolvePilot();
  if (r.error) return r.error;

  let body: { reviewId?: unknown; note?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (typeof body.reviewId !== "string" || !body.reviewId) {
    return NextResponse.json({ error: "reviewId is required." }, { status: 400 });
  }

  const result = await requestReviewReconsideration(
    r.profile.id,
    body.reviewId,
    typeof body.note === "string" ? body.note : null,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ request: result.request });
}
