import { NextResponse } from "next/server";
import { requirePilotSession } from "@/lib/auth/require-pilot";
import {
  resolveInstructorAddonStatus,
  setPilotInstructorAddon,
} from "@/lib/membership/instructor-addon";
import { getCurrentPilotSubscription } from "@/lib/subscriptions/subscription";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
  toPilotProfileDto,
} from "@/lib/pilot/profile";
import { PILOT_INSTRUCTOR_ADDON_FEE_USD } from "@/lib/membership/pilot-membership-catalog";
import { prisma } from "@/lib/db";
import { averageRating } from "@/lib/reviews/review";
import { parsePortfolioJson } from "@/lib/pilot/portfolio";

function formatTrainingLocation(profile: {
  locationCity: string | null;
  locationRegion: string | null;
  locationCountry: string | null;
}): string | null {
  const parts = [
    profile.locationCity,
    profile.locationRegion,
    profile.locationCountry,
  ].filter((part): part is string => Boolean(part?.trim()));
  return parts.length > 0 ? parts.join(", ") : null;
}

function resolveFlightSchool(portfolioJson: string): string | null {
  const items = parsePortfolioJson(portfolioJson);
  for (const item of items) {
    const title = item.title?.trim() ?? "";
    const description = item.description?.trim() ?? "";
    const haystack = `${title} ${description}`.toLowerCase();
    if (
      haystack.includes("flight school") ||
      haystack.includes("academy") ||
      haystack.includes("training")
    ) {
      return title || description || null;
    }
  }
  return null;
}

export async function GET() {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 403 },
    );
  }

  const subscription = await getCurrentPilotSubscription(profile.id);
  const status = resolveInstructorAddonStatus({
    hasActiveMembership: subscription !== null,
    tierCode: subscription?.plan.code ?? null,
    instructorAddonActive: profile.instructorAddonActive,
  });

  const ratings = await prisma.review.findMany({
    where: {
      targetPilotProfileId: profile.id,
      status: "published",
    },
    select: { rating: true },
    take: 100,
  });

  return NextResponse.json({
    feeUsd: PILOT_INSTRUCTOR_ADDON_FEE_USD,
    status,
    profile: toPilotProfileDto(profile),
    preview: {
      displayName: profile.displayName,
      bio: profile.bio,
      flightSchool: resolveFlightSchool(profile.portfolioJson),
      trainingLocation: formatTrainingLocation(profile),
      averageRating: averageRating(ratings),
    },
  });
}

export async function POST(request: Request) {
  const authResult = await requirePilotSession();
  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    );
  }

  const profile = await getPilotProfileByUserId(authResult.userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return NextResponse.json(
      { error: "Complete pilot onboarding first." },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const active = body.active === true;
    const result = await setPilotInstructorAddon(profile.id, active);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const fresh = await prisma.pilotProfile.findUnique({
      where: { id: profile.id },
    });

    return NextResponse.json({
      profile: result.profile,
      feeUsd: result.feeUsd,
      status: result.status,
      preview: {
        displayName: result.profile.displayName,
        bio: result.profile.bio,
        flightSchool: resolveFlightSchool(fresh?.portfolioJson ?? "[]"),
        trainingLocation: formatTrainingLocation(result.profile),
        averageRating: null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
