import type { PilotProfile } from "@/generated/prisma/client";
import { listOpenJobsForPilot } from "@/lib/applications/application";
import { listCertificatesForPilot } from "@/lib/certificates/certificate";
import { prisma } from "@/lib/db";
import { listPaymentsForPilotUser } from "@/lib/payments/payment";
import { computePilotGradeProgressPct } from "@/lib/pilot/pilot-profile-strength";
import { getApprovedVerificationTypes } from "@/lib/verification/verification";
import { listPublicPilotWings } from "@/lib/wings/wings";

const ACTIVE_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
] as const;

export type PilotDashboardOverview = {
  availableJobs: number;
  activeBookings: number;
  submittedBids: number;
  completedBookings: number;
  demoEarningsUsd: number;
  averageRating: number | null;
  reviewCount: number;
  wingsCount: number;
  certificatesCount: number;
  verifiedTypes: string[];
  profileCompletionPct: number;
};

export async function getPilotDashboardOverview(
  pilotProfileId: string,
  userId: string,
  profile: PilotProfile,
  approved: boolean,
): Promise<PilotDashboardOverview> {
  const [
    applicationCount,
    activeBookings,
    completedBookings,
    reviewAgg,
    wings,
    certificates,
    verifiedTypes,
    payments,
    jobsSnapshot,
  ] = await Promise.all([
    prisma.jobApplication.count({ where: { pilotProfileId, status: { not: "draft" } } }),
    prisma.booking.count({
      where: {
        pilotProfileId,
        status: { in: [...ACTIVE_BOOKING_STATUSES] },
      },
    }),
    prisma.booking.count({
      where: { pilotProfileId, status: "completed" },
    }),
    prisma.review.aggregate({
      where: {
        targetPilotProfileId: pilotProfileId,
        status: "published",
      },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    listPublicPilotWings(pilotProfileId),
    listCertificatesForPilot(pilotProfileId),
    getApprovedVerificationTypes(pilotProfileId),
    listPaymentsForPilotUser(userId),
    approved ? listOpenJobsForPilot(pilotProfileId) : Promise.resolve(null),
  ]);

  const earningsUsd = payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amountNet, 0);

  const availableJobs = jobsSnapshot
    ? jobsSnapshot.jobs.length + jobsSnapshot.lockedJobs.length
    : 0;

  const avg = reviewAgg._avg.rating;
  const insuranceVerified = verifiedTypes.includes("insurance");

  return {
    availableJobs,
    activeBookings,
    submittedBids: applicationCount,
    completedBookings,
    demoEarningsUsd: earningsUsd,
    averageRating:
      reviewAgg._count.rating > 0 && avg != null
        ? Math.round(avg * 10) / 10
        : null,
    reviewCount: reviewAgg._count.rating,
    wingsCount: wings.length,
    certificatesCount: certificates.length,
    verifiedTypes,
    profileCompletionPct: computePilotGradeProgressPct({
      displayName: profile.displayName,
      bio: profile.bio,
      locationCity: profile.locationCity,
      locationCountry: profile.locationCountry,
      servicesOffered: profile.servicesOffered,
      portfolioJson: profile.portfolioJson,
      profileExtrasJson: profile.profileExtrasJson,
      complianceAcceptedAt: profile.complianceAcceptedAt,
      insuranceVerified,
    }),
  };
}
