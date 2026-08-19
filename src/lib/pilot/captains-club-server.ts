import "server-only";

import { prisma } from "@/lib/db";
import { CAPTAINS_CLUB_ROUTES } from "@/lib/marketing/captains-club-content";
import { formatMemberNumber } from "@/lib/members/member-number";
import {
  CAPTAINS_CLUB_TIER_CODES,
} from "@/lib/membership/tiers";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/membership/pricing-tier-codes";
import {
  buildCaptainClubStats,
  regionGroupForCountry,
  regionOptionsFromCaptains,
  specialtyOptionsFromCaptains,
} from "@/lib/pilot/captains-club";
import { averageRating } from "@/lib/reviews/review";
import { parseServicesOffered } from "@/lib/pilot/profile";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { PILOT_SERVICE_OPTIONS, type PilotServiceId } from "@/types/pilot";
import type { CaptainClubPilot, CaptainClubStats } from "@/types/captains-club";
import { BADGE_RARITY_RANK } from "@/types/admin-badges";

const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

const SERVICE_LABELS = Object.fromEntries(
  PILOT_SERVICE_OPTIONS.map((option) => [option.id, option.label]),
) as Record<PilotServiceId, string>;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function lastNameFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts[parts.length - 1] ?? "";
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

function tierLabelForCode(tierCode: string, planName: string): string {
  const pricing = TIER_CODE_TO_PRICING_PLAN_CODE[tierCode];
  if (!pricing) return planName.toUpperCase();
  const title = planName.replace(/^A-\d+\s+/i, "").trim();
  return `${pricing} ${title}`.toUpperCase();
}

function pickHighestRarityWing(
  wings: Array<{ title: string; rarity: string }>,
): { wingTypeLabel: string; wingSortKey: string } {
  if (wings.length === 0) {
    return { wingTypeLabel: "", wingSortKey: "~" };
  }

  let best = wings[0]!;
  let bestRank = BADGE_RARITY_RANK[best.rarity as keyof typeof BADGE_RARITY_RANK] ?? -1;
  for (const wing of wings.slice(1)) {
    const rank =
      BADGE_RARITY_RANK[wing.rarity as keyof typeof BADGE_RARITY_RANK] ?? -1;
    if (
      rank > bestRank ||
      (rank === bestRank && wing.title.localeCompare(best.title) < 0)
    ) {
      best = wing;
      bestRank = rank;
    }
  }

  // Higher rarity first when sorting ascending on wingSortKey → use inverted rank.
  const inverted = String(999 - bestRank).padStart(3, "0");
  return {
    wingTypeLabel: best.title,
    wingSortKey: `${inverted}:${best.title.toLowerCase()}`,
  };
}

export async function listCaptainsClubPilots(): Promise<CaptainClubPilot[]> {
  const pilots = await prisma.pilotProfile.findMany({
    where: {
      status: "approved",
      isPublic: true,
      subscriptions: {
        some: {
          status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] },
          subscriptionPlan: {
            code: { in: [...CAPTAINS_CLUB_TIER_CODES] },
          },
        },
      },
    },
    include: {
      user: { select: { memberNumber: true } },
      verifications: {
        where: { status: "approved" },
        select: { type: true },
      },
      certificates: { select: { id: true }, take: 1 },
      wings: {
        include: {
          wingDefinition: { select: { title: true, rarity: true } },
        },
      },
      subscriptions: {
        where: { status: { in: [...ACTIVE_SUBSCRIPTION_STATUSES] } },
        include: { subscriptionPlan: { select: { code: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
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

    const clubSub = pilot.subscriptions.find((sub) => {
      const code = sub.subscriptionPlan.code;
      return (
        typeof code === "string" &&
        (CAPTAINS_CLUB_TIER_CODES as readonly string[]).includes(code)
      );
    });
    const tierCode = clubSub?.subscriptionPlan.code ?? "A6_CAPTAIN";
    const planName = clubSub?.subscriptionPlan.name ?? "A-6 Captain";

    const { wingTypeLabel, wingSortKey } = pickHighestRarityWing(
      pilot.wings.map((entry) => ({
        title: entry.wingDefinition.title,
        rarity: entry.wingDefinition.rarity,
      })),
    );

    return {
      id: pilot.id,
      initials: initialsFromName(pilot.displayName),
      avatarUrl: parseProfileExtrasJson(pilot.profileExtrasJson).avatarUrl,
      name: pilot.displayName,
      lastName: lastNameFromDisplayName(pilot.displayName),
      memberNumber: pilot.user.memberNumber
        ? formatMemberNumber(pilot.user.memberNumber)
        : null,
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
      tierLabel: tierLabelForCode(tierCode, planName),
      tierCode,
      wingTypeLabel,
      wingSortKey,
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
