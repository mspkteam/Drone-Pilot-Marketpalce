import "server-only";

import { prisma } from "@/lib/db";
import { CAPTAINS_CLUB_ROUTES } from "@/lib/marketing/captains-club-content";
import {
  buildCaptainClubStats,
  regionGroupForCountry,
  regionOptionsFromCaptains,
  specialtyOptionsFromCaptains,
} from "@/lib/pilot/captains-club";
import { averageRating } from "@/lib/reviews/review";
import { parseServicesOffered } from "@/lib/pilot/profile";
import { PILOT_SERVICE_OPTIONS, type PilotServiceId } from "@/types/pilot";
import type { CaptainClubPilot, CaptainClubStats } from "@/types/captains-club";

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;
const CAPTAIN_TIER_CODE = "A6_CAPTAIN";

const SERVICE_LABELS = Object.fromEntries(
  PILOT_SERVICE_OPTIONS.map((option) => [option.id, option.label]),
) as Record<PilotServiceId, string>;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatLocation(
  city: string | null,
  region: string | null,
  country: string | null,
): string {
  return [city, region].filter(Boolean).join(", ") || country || "Location not set";
}

function buildBadges(input: {
  hasApprovedLicense: boolean;
  hasApprovedInsurance: boolean;
  hasCertificate: boolean;
}): CaptainClubPilot["badges"] {
  const badges: CaptainClubPilot["badges"][number][] = ["captain"];
  if (input.hasApprovedLicense || input.hasApprovedInsurance) {
    badges.push("verified");
  }
  if (input.hasCertificate) {
    badges.push("certified");
  }
  if (input.hasApprovedInsurance) {
    badges.push("insured");
  }
  return badges;
}

export async function listCaptainsClubPilots(): Promise<CaptainClubPilot[]> {
  const pilots = await prisma.pilotProfile.findMany({
    where: {
      status: "approved",
      isPublic: true,
      subscriptions: {
        some: {
          status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] },
          subscriptionPlan: { code: CAPTAIN_TIER_CODE },
        },
      },
    },
    include: {
      verifications: {
        where: { status: "approved" },
        select: { type: true },
      },
      certificates: { select: { id: true }, take: 1 },
    },
    orderBy: { displayName: "asc" },
  });

  if (pilots.length === 0) return [];

  const pilotIds = pilots.map((pilot) => pilot.id);
  const reviews = await prisma.review.findMany({
    where: {
      targetPilotProfileId: { in: pilotIds },
      status: "published",
    },
    select: { targetPilotProfileId: true, rating: true },
  });

  const reviewMap = new Map<string, number[]>();
  for (const review of reviews) {
    if (!review.targetPilotProfileId) continue;
    const ratings = reviewMap.get(review.targetPilotProfileId) ?? [];
    ratings.push(review.rating);
    reviewMap.set(review.targetPilotProfileId, ratings);
  }

  return pilots.map((pilot) => {
    const serviceIds = parseServicesOffered(pilot.servicesOffered) as PilotServiceId[];
    const specialtyLabels = serviceIds.map(
      (serviceId) => SERVICE_LABELS[serviceId] ?? serviceId,
    );
    const approvedTypes = new Set(pilot.verifications.map((entry) => entry.type));
    const ratings = reviewMap.get(pilot.id) ?? [];
    const average = averageRating(ratings.map((rating) => ({ rating })));

    return {
      id: pilot.id,
      initials: initialsFromName(pilot.displayName),
      name: pilot.displayName,
      location: formatLocation(
        pilot.locationCity,
        pilot.locationRegion,
        pilot.locationCountry,
      ),
      regionGroup: regionGroupForCountry(pilot.locationCountry),
      rating: average,
      ratingLabel: average != null ? average.toFixed(1) : "New",
      reviewCount: ratings.length,
      bio: pilot.bio,
      badges: buildBadges({
        hasApprovedLicense: approvedTypes.has("license"),
        hasApprovedInsurance: approvedTypes.has("insurance"),
        hasCertificate: pilot.certificates.length > 0,
      }),
      tierLabel: "A-6 CAPTAIN",
      serviceIds,
      specialtyLabels,
      profileHref: CAPTAINS_CLUB_ROUTES.pilotProfile(pilot.id),
    };
  });
}

export async function getCaptainsClubPageData(): Promise<{
  captains: CaptainClubPilot[];
  stats: CaptainClubStats;
  regions: string[];
  specialties: { id: PilotServiceId; label: string }[];
}> {
  const captains = await listCaptainsClubPilots();
  const stats = buildCaptainClubStats(captains);

  return {
    captains,
    stats,
    regions: regionOptionsFromCaptains(captains),
    specialties: specialtyOptionsFromCaptains(captains),
  };
}
