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
import {
  PILOT_MOCK_ACTIVITY,
  PILOT_MOCK_LOCKED_JOBS,
  PILOT_MOCK_RECOMMENDED_JOBS,
  PILOT_MOCK_REVIEWS,
  type PilotMockLockedJob,
  type PilotMockRecommendedJob,
  type PilotMockReview,
} from "@/lib/pilot/dashboard-overview-mock";
import { getApprovedVerificationTypes } from "@/lib/verification/verification";

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
    href: `/dashboard/pilot/jobs/${job.id}`,
    hasApplied: job.hasApplied,
  };
}

function mapMockJob(job: PilotMockRecommendedJob): PilotRecommendedJobCard {
  return {
    id: job.id,
    category: job.category,
    price: job.price,
    title: job.title,
    location: job.location,
    time: job.time,
    href: job.href,
    hasApplied: false,
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

function mapMockLocked(job: PilotMockLockedJob): PilotLockedJobRow {
  return {
    id: job.id,
    title: job.title,
    requirement: job.requirement,
    unlockAt: job.unlockAt,
  };
}

function buildProfileChecklist(
  profile: PilotProfile,
  verifiedTypes: string[],
): PilotProfileStrengthItem[] {
  const photoBioDone =
    Boolean(profile.displayName?.trim()) && Boolean(profile.bio?.trim());
  const licenseDone = verifiedTypes.includes("license");
  const insuranceDone = verifiedTypes.includes("insurance");

  return [
    { label: "Photo & Bio", status: photoBioDone ? "done" : "missing" },
    { label: "License Verified", status: licenseDone ? "done" : "missing" },
    {
      label: "Portfolio (4/8)",
      status: "partial",
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

function mapMockReview(review: PilotMockReview): PilotDashboardReviewCard {
  return {
    id: review.id,
    title: review.title,
    date: review.date,
    rating: review.rating,
    text: review.text,
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

  const usingMockRecommendedJobs = approved && liveJobs.length === 0;
  const recommendedJobs = usingMockRecommendedJobs
    ? PILOT_MOCK_RECOMMENDED_JOBS.map(mapMockJob)
    : liveJobs.slice(0, 4).map(mapOpenJobToCard);

  const usingMockLockedJobs = approved && liveLocked.length === 0;
  const lockedJobs = usingMockLockedJobs
    ? PILOT_MOCK_LOCKED_JOBS.map(mapMockLocked)
    : liveLocked.slice(0, 4).map(mapLockedJob);

  const reviewCards =
    recentReviews.length > 0
      ? recentReviews.map(mapReviewToCard)
      : PILOT_MOCK_REVIEWS.map(mapMockReview);

  const activityItems: PilotDashboardActivityItem[] =
    notifications.length > 0
      ? notifications.map((n) => ({
          id: n.id,
          text: n.body || n.title,
          timeLabel: formatRelativeTime(n.createdAt.toISOString()),
          tone: notificationTone(n.type),
        }))
      : [...PILOT_MOCK_ACTIVITY];

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
    usingMockRecommendedJobs,
    lockedJobs,
    usingMockLockedJobs,
    stats: {
      totalEarnings,
      earningsThisMonth,
      activeContracts: overview.activeBookings,
      contractsDueThisWeek,
      pendingProposals,
      shortlistedProposals: 0,
      completedJobs: overview.completedBookings,
      onTimeRatePct: overview.completedBookings > 0 ? 98 : null,
    },
    profileStrength: {
      pct: overview.profileCompletionPct,
      items: buildProfileChecklist(profile, verifiedTypes),
    },
    reviews: {
      averageRating: overview.averageRating,
      count: overview.reviewCount,
      items: reviewCards,
      usingMockReviews: recentReviews.length === 0,
    },
    activity: {
      items: activityItems,
      usingMockActivity: notifications.length === 0,
    },
    hero: {
      newRecommendedJobs: usingMockRecommendedJobs
        ? PILOT_MOCK_RECOMMENDED_JOBS.length
        : liveJobs.length,
      proposalsAwaitingResponse: pendingProposals,
    },
  };
}
