import type { PilotProfile } from "@/generated/prisma/client";
import { listOpenJobsForPilot } from "@/lib/applications/application";
import { listCertificatesForPilot } from "@/lib/certificates/certificate";
import { prisma } from "@/lib/db";
import { listPaymentsForPilotUser } from "@/lib/payments/payment";
import { parseServicesOffered } from "@/lib/pilot/profile";
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

function profileCompletionPercent(profile: PilotProfile): number {
  const checks = [
    Boolean(profile.displayName?.trim()),
    Boolean(profile.bio?.trim()),
    Boolean(profile.locationCity?.trim() || profile.locationCountry?.trim()),
    parseServicesOffered(profile.servicesOffered).length > 0,
    profile.hourlyRateMin != null || profile.hourlyRateMax != null,
    Boolean(profile.licenseNumber?.trim()),
    Boolean(profile.complianceAcceptedAt),
    Boolean(profile.onboardingCompletedAt),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

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
    profileCompletionPct: profileCompletionPercent(profile),
  };
}
