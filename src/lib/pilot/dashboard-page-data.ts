import type { PilotProfile } from "@/generated/prisma/client";
import { listOpenJobsForPilot } from "@/lib/applications/application";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import { rankLabelForTier } from "@/lib/dashboard/shell-user";
import { getPilotMembershipSummary } from "@/lib/membership/membership";
import { prisma } from "@/lib/db";
import { JOB_CATEGORIES } from "@/types/job";
import type { PilotLockedJobDto, PilotOpenJobDto } from "@/types/application";
import type { PilotMembershipSummaryDto } from "@/types/membership";
import type { PilotProfileStatus } from "@/types/pilot";
import {
  getPilotDashboardOverview,
  type PilotDashboardOverview,
} from "@/lib/pilot/dashboard";
import { getApprovedVerificationTypes } from "@/lib/verification/verification";
import {
  parsePortfolioJson,
  portfolioStrengthLabel,
  portfolioStrengthStatus,
} from "@/lib/pilot/portfolio";

export type PilotDashboardActivityTone =
  | "success"
  | "gold"
  | "warning"
  | "muted";

export type PilotDashboardActivityItem = {
  id: string;
  text: string;
  timeLabel: string;
  tone: PilotDashboardActivityTone;
};

export type PilotProfileStrengthStatus = "done" | "partial" | "missing";

export type PilotProfileStrengthItem = {
  label: string;
  status: PilotProfileStrengthStatus;
};

export type PilotRecommendedJobCard = {
  id: string;
  category: string;
  price: string;
  title: string;
  location: string;
  time: string;
  href: string;
  hasApplied: boolean;
};

export type PilotLockedJobRow = {
  id: string;
  title: string;
  requirement: string;
  unlockAt: string;
};

export type PilotDashboardReviewCard = {
  id: string;
  title: string;
  date: string;
  rating: number;
  text: string;
};

export type PilotDashboardPageData = {
  displayName: string;
  approved: boolean;
  status: PilotProfileStatus;
  overview: PilotDashboardOverview;
  membership: PilotMembershipSummaryDto | null;
  rankBadge: string;
  membershipDaysLeft: number | null;
  isVerified: boolean;
  recommendedJobs: PilotRecommendedJobCard[];
  usingMockRecommendedJobs: boolean;
  lockedJobs: PilotLockedJobRow[];
  usingMockLockedJobs: boolean;
  stats: {
    totalEarnings: number;
    earningsThisMonth: number;
    activeContracts: number;
    contractsDueThisWeek: number;
    pendingProposals: number;
    shortlistedProposals: number;
    completedJobs: number;
    onTimeRatePct: number | null;
  };
  profileStrength: {
    pct: number;
    items: PilotProfileStrengthItem[];
  };
  reviews: {
    averageRating: number | null;
    count: number;
    items: PilotDashboardReviewCard[];
    usingMockReviews: boolean;
  };
  activity: {
    items: PilotDashboardActivityItem[];
    usingMockActivity: boolean;
  };
  hero: {
    newRecommendedJobs: number;
    proposalsAwaitingResponse: number;
  };
};

function categoryLabel(id: string): string {
  return (
    JOB_CATEGORIES.find((c) => c.id === id)?.label.toUpperCase() ?? id.toUpperCase()
  );
}

function formatJobTime(job: PilotOpenJobDto): string {
  if (job.scheduledDate) {
    const d = new Date(job.scheduledDate);
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = d
      .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
      .toUpperCase();
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const mins = d.getUTCMinutes().toString().padStart(2, "0");
    return `${day} ${month} · ${hours}:${mins}Z`;
  }
  return "ASAP · FLEXIBLE";
}

function formatJobPrice(job: PilotOpenJobDto): string {
  const budget = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);
  if (budget) {
    const numeric = budget.replace(/[^\d,–-]/g, "").replace("–", "-");
    if (numeric.includes("-")) {
      const max = numeric.split("-").pop()?.replace(/,/g, "");
      return max ? `$${Number(max).toLocaleString()}` : budget;
    }
    const amount = numeric.replace(/,/g, "");
    return amount ? `$${Number(amount).toLocaleString()}` : budget;
  }
  return "OPEN";
}

function mapOpenJobToCard(job: PilotOpenJobDto): PilotRecommendedJobCard {
  return {
    id: job.id,
    category: categoryLabel(job.category),
    price: formatJobPrice(job),
    title: job.title,
    location: job.locationLabel,
    time: formatJobTime(job),
    href: job.hasApplied && job.applicationId
      ? `/dashboard/pilot/proposals/${job.applicationId}`
      : job.canApply
        ? `/dashboard/pilot/jobs/${job.id}/proposal`
        : `/dashboard/pilot/jobs/${job.id}`,
    hasApplied: job.hasApplied,
  };
}

function mapLockedJob(job: PilotLockedJobDto): PilotLockedJobRow {
  return {
    id: job.id,
    title: job.title,
    requirement: `TIER DELAY · ${job.jobVisibilityDelayHours}H`,
    unlockAt: job.visibleAt,
  };
}

function buildProfileChecklist(
  profile: PilotProfile,
  verifiedTypes: string[],
  portfolioCount: number,
): PilotProfileStrengthItem[] {
  const photoBioDone =
    Boolean(profile.displayName?.trim()) && Boolean(profile.bio?.trim());
  const licenseDone = verifiedTypes.includes("license");
  const insuranceDone = verifiedTypes.includes("insurance");
  const portfolioStatus = portfolioStrengthStatus(portfolioCount);

  return [
    { label: "Photo & Bio", status: photoBioDone ? "done" : "missing" },
    { label: "License Verified", status: licenseDone ? "done" : "missing" },
    {
      label: portfolioStrengthLabel(portfolioCount),
      status: portfolioStatus,
    },
    { label: "Insurance Doc", status: insuranceDone ? "done" : "missing" },
  ];
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)} MIN AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} HR AGO`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "YESTERDAY";
  return `${days}D AGO`;
}

function notificationTone(type: string): PilotDashboardActivityTone {
  if (type.includes("payment") || type.includes("payout")) return "gold";
  if (type.includes("bid") || type.includes("application")) return "success";
  if (type.includes("verification") || type.includes("insurance")) return "warning";
  if (type.includes("booking") || type.includes("message")) return "gold";
  return "muted";
}

function mapReviewToCard(review: {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  booking: { job: { title: string } };
  authorLabel?: string;
}): PilotDashboardReviewCard {
  const d = new Date(review.createdAt);
  const date = `${d
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase()} ${d.getDate()} ${d.getFullYear()}`;
  return {
    id: review.id,
    title: review.booking.job.title,
    date,
    rating: review.rating,
    text: (review.comment ?? "").toUpperCase(),
  };
}

export async function getPilotDashboardPageData(
  pilotProfileId: string,
  userId: string,
  profile: PilotProfile,
  approved: boolean,
): Promise<PilotDashboardPageData> {
  const membership = approved
    ? await getPilotMembershipSummary(pilotProfileId)
    : null;

  const overview = await getPilotDashboardOverview(
    pilotProfileId,
    userId,
    profile,
    approved,
  );

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    pendingProposals,
    shortlistedProposals,
    contractsDueThisWeek,
    recentReviews,
    notifications,
    verifiedTypes,
    jobsSnapshot,
    payments,
  ] = await Promise.all([
    prisma.jobApplication.count({
      where: { pilotProfileId, status: "submitted" },
    }),
    prisma.jobApplication.count({
      where: {
        pilotProfileId,
        status: "submitted",
        shortlistedAt: { not: null },
      },
    }),
    prisma.booking.count({
      where: {
        pilotProfileId,
        status: { in: ["confirmed", "in_progress", "pending"] },
        scheduledStartAt: { gte: now, lte: weekEnd },
      },
    }),
    prisma.review.findMany({
      where: {
        targetPilotProfileId: pilotProfileId,
        status: "published",
      },
      orderBy: { createdAt: "desc" },
      take: 2,
      include: {
        booking: { include: { job: { select: { title: true } } } },
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    getApprovedVerificationTypes(pilotProfileId),
    approved ? listOpenJobsForPilot(pilotProfileId) : Promise.resolve(null),
    prisma.payment.findMany({
      where: {
        booking: { pilotProfileId },
        status: "succeeded",
      },
      select: { amountNet: true, createdAt: true },
    }),
  ]);

  const totalEarnings = payments.reduce((sum, p) => sum + p.amountNet, 0);
  const earningsThisMonth = payments
    .filter((p) => new Date(p.createdAt) >= monthStart)
    .reduce((sum, p) => sum + p.amountNet, 0);

  const liveJobs = jobsSnapshot?.jobs ?? [];
  const liveLocked = jobsSnapshot?.lockedJobs ?? [];

  const recommendedJobs = liveJobs.slice(0, 4).map(mapOpenJobToCard);
  const lockedJobs = liveLocked.slice(0, 4).map(mapLockedJob);
  const reviewCards = recentReviews.map(mapReviewToCard);

  const activityItems: PilotDashboardActivityItem[] = notifications.map((n) => ({
    id: n.id,
    text: n.body || n.title,
    timeLabel: formatRelativeTime(n.createdAt.toISOString()),
    tone: notificationTone(n.type),
  }));

  const membershipDaysLeft = membership?.currentPeriodEnd
    ? Math.max(
        0,
        Math.ceil(
          (new Date(membership.currentPeriodEnd).getTime() - Date.now()) /
            (24 * 60 * 60 * 1000),
        ),
      )
    : null;

  const rankBadge = rankLabelForTier(membership?.tier.code);
  const isVerified = verifiedTypes.length > 0;

  return {
    displayName: profile.displayName,
    approved,
    status: profile.status as PilotProfileStatus,
    overview,
    membership,
    rankBadge,
    membershipDaysLeft,
    isVerified,
    recommendedJobs,
    usingMockRecommendedJobs: false,
    lockedJobs,
    usingMockLockedJobs: false,
    stats: {
      totalEarnings,
      earningsThisMonth,
      activeContracts: overview.activeBookings,
      contractsDueThisWeek,
      pendingProposals,
      shortlistedProposals,
            completedJobs: overview.completedBookings,
            onTimeRatePct: null,
    },
    profileStrength: {
      pct: overview.profileCompletionPct,
      items: buildProfileChecklist(
        profile,
        verifiedTypes,
        parsePortfolioJson(profile.portfolioJson).length,
      ),
    },
    reviews: {
      averageRating: overview.averageRating,
      count: overview.reviewCount,
      items: reviewCards,
      usingMockReviews: false,
    },
    activity: {
      items: activityItems,
      usingMockActivity: false,
    },
    hero: {
      newRecommendedJobs: liveJobs.length,
      proposalsAwaitingResponse: pendingProposals,
    },
  };
}
