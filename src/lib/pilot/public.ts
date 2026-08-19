import { prisma } from "@/lib/db";
import { listCertificatesForPilot } from "@/lib/certificates/certificate";
import { getPilotMembershipSummary } from "@/lib/membership/membership";
import { averageRating } from "@/lib/reviews/review";
import { parseServicesOffered } from "@/lib/pilot/profile";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { parsePortfolioJson } from "@/lib/pilot/portfolio";
import { getApprovedVerificationTypes } from "@/lib/verification/verification";
import { listPublicPilotWings } from "@/lib/wings/wings";
import type { PilotServiceId } from "@/types/pilot";
import type {
  PublicPilotCertificateDto,
  PublicPilotListItemDto,
  PublicPilotMembershipDto,
  PublicPilotProfileDto,
  PublicPilotReviewDto,
} from "@/types/public-pilot";

async function getReviewStatsForPilots(pilotProfileIds: string[]) {
  if (pilotProfileIds.length === 0) return new Map<string, { average: number | null; count: number }>();

  const reviews = await prisma.review.findMany({
    where: {
      targetPilotProfileId: { in: pilotProfileIds },
      status: "published",
    },
    select: { targetPilotProfileId: true, rating: true },
  });

  const map = new Map<string, { ratings: number[] }>();
  for (const r of reviews) {
    if (!r.targetPilotProfileId) continue;
    const entry = map.get(r.targetPilotProfileId) ?? { ratings: [] };
    entry.ratings.push(r.rating);
    map.set(r.targetPilotProfileId, entry);
  }

  const result = new Map<string, { average: number | null; count: number }>();
  for (const [id, { ratings }] of map) {
    result.set(id, {
      average: averageRating(ratings.map((rating) => ({ rating }))),
      count: ratings.length,
    });
  }
  return result;
}

function toListItem(
  profile: {
    id: string;
    displayName: string;
    bio: string | null;
    locationCity: string | null;
    locationRegion: string | null;
    locationCountry: string | null;
    servicesOffered: string;
    hourlyRateMin: number | null;
    hourlyRateMax: number | null;
    profileExtrasJson?: string | null;
  },
  stats: { average: number | null; count: number },
): PublicPilotListItemDto {
  return {
    id: profile.id,
    displayName: profile.displayName,
    bio: profile.bio,
    locationCity: profile.locationCity,
    locationRegion: profile.locationRegion,
    locationCountry: profile.locationCountry,
    servicesOffered: parseServicesOffered(profile.servicesOffered) as PilotServiceId[],
    hourlyRateMin: profile.hourlyRateMin,
    hourlyRateMax: profile.hourlyRateMax,
    averageRating: stats.average,
    reviewCount: stats.count,
    avatarUrl: parseProfileExtrasJson(profile.profileExtrasJson).avatarUrl,
  };
}

export async function listPublicPilots(): Promise<PublicPilotListItemDto[]> {
  const pilots = await prisma.pilotProfile.findMany({
    where: { status: "approved", isPublic: true },
    orderBy: { displayName: "asc" },
  });

  const stats = await getReviewStatsForPilots(pilots.map((p) => p.id));

  return pilots.map((p) =>
    toListItem(p, stats.get(p.id) ?? { average: null, count: 0 }),
  );
}

export async function getPublicPilotById(
  id: string,
): Promise<PublicPilotProfileDto | null> {
  const profile = await prisma.pilotProfile.findFirst({
    where: { id, status: "approved", isPublic: true },
  });

  if (!profile) return null;

  const stats = await getReviewStatsForPilots([profile.id]);
  const stat = stats.get(profile.id) ?? { average: null, count: 0 };

  const reviews = await prisma.review.findMany({
    where: {
      targetPilotProfileId: profile.id,
      status: "published",
    },
    include: {
      authorUser: {
        select: {
          clientProfile: { select: { contactName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentReviews: PublicPilotReviewDto[] = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    authorLabel: r.authorUser.clientProfile?.contactName ?? "Client",
    createdAt: r.createdAt.toISOString(),
  }));

  const [verifiedTypes, wings, certRows, membershipSummary] =
    await Promise.all([
      getApprovedVerificationTypes(profile.id),
      listPublicPilotWings(profile.id),
      listCertificatesForPilot(profile.id),
      getPilotMembershipSummary(profile.id),
    ]);

  const certificates: PublicPilotCertificateDto[] = certRows.map((c) => ({
    id: c.id,
    certificateNumber: c.certificateNumber,
    templateName: c.templateName,
    issuedAt: c.issuedAt,
  }));

  const membership: PublicPilotMembershipDto | null = membershipSummary
    ? {
        tierCode: membershipSummary.tier.code,
        tierName: membershipSummary.tier.name,
        status: membershipSummary.status,
        jobVisibilityDelayHours:
          membershipSummary.tier.jobVisibilityDelayHours,
        canApply: membershipSummary.tier.canApply,
        canViewJobs: membershipSummary.tier.canViewJobs,
        instructorEligible: membershipSummary.tier.instructorEligible,
      }
    : null;

  const extras = parseProfileExtrasJson(profile.profileExtrasJson);

  return {
    ...toListItem(profile, stat),
    serviceRadiusKm: profile.serviceRadiusKm,
    callSign: extras.callSign.trim() || null,
    mainDrones: extras.mainDrones,
    payloads: extras.payloads,
    portfolio: parsePortfolioJson(profile.portfolioJson),
    verifiedTypes,
    recentReviews,
    wings,
    certificates,
    membership,
    instructorListed: profile.instructorAddonActive,
  };
}
