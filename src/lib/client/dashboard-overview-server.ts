import "server-only";

import {
  formatClientProjectBudget,
  formatClientProjectPostedLabel,
} from "@/lib/client/my-projects";
import {
  mapNotificationToActivity,
  mapPublicPilotToRecommended,
  type ClientActivityItem,
  type ClientDashboardOverviewData,
  type ClientDashboardStat,
  type ClientProjectStatus,
  type ClientRecentProject,
} from "@/lib/client/dashboard-overview";
import { prisma } from "@/lib/db";
import { listNotificationsForUser } from "@/lib/notifications/notify";
import { listPublicPilots } from "@/lib/pilot/public";
import type { JobStatus } from "@/types/job";

const ACTIVE_JOB_STATUSES: JobStatus[] = [
  "pending_approval",
  "approved",
  "open",
  "in_bidding",
  "assigned",
];

import { clientFirstDisplayName } from "@/lib/client/display-name";

function recentProjectStatus(input: {
  hasBooking: boolean;
  submittedBidCount: number;
}): { status: ClientProjectStatus; statusLabel: string } {
  if (input.hasBooking) {
    return { status: "pilot_selected", statusLabel: "Pilot Selected" };
  }
  if (input.submittedBidCount > 0) {
    return { status: "quotes_received", statusLabel: "Quotes Received" };
  }
  return { status: "awaiting_quotes", statusLabel: "Awaiting Quotes" };
}

function buildRecentProjectMetadata(input: {
  submittedBidCount: number;
  postedLabel: string;
  budget: string;
  pilotName?: string | null;
  hasBooking: boolean;
}): string {
  if (input.hasBooking && input.pilotName) {
    return `${input.pilotName} assigned · ${input.postedLabel} · ${input.budget}`;
  }

  const quoteLabel =
    input.submittedBidCount === 1
      ? "1 quote received"
      : `${input.submittedBidCount} quotes received`;

  return `${quoteLabel} · ${input.postedLabel} · ${input.budget}`;
}

export async function getClientDashboardOverviewData(
  clientProfileId: string,
  userId: string,
): Promise<ClientDashboardOverviewData> {
  const profile = await prisma.clientProfile.findUnique({
    where: { id: clientProfileId },
    select: { contactName: true, companyName: true },
  });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    jobRows,
    quotesReceived,
    completedBookings,
    pendingActions,
    recentJobRows,
    notifications,
    publicPilots,
  ] = await Promise.all([
    prisma.job.findMany({
      where: { clientProfileId },
      select: { status: true, createdAt: true },
    }),
    prisma.jobApplication.count({
      where: {
        status: "submitted",
        job: { clientProfileId },
      },
    }),
    prisma.booking.count({
      where: { clientProfileId, status: "completed" },
    }),
    prisma.jobApplication.count({
      where: {
        status: "submitted",
        job: { clientProfileId, booking: null },
      },
    }),
    prisma.job.findMany({
      where: { clientProfileId, status: { not: "draft" } },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        submittedAt: true,
        createdAt: true,
        budgetMin: true,
        budgetMax: true,
        currency: true,
        booking: {
          select: {
            pilotProfile: { select: { displayName: true } },
          },
        },
        _count: {
          select: {
            applications: { where: { status: "submitted" } },
          },
        },
      },
    }),
    listNotificationsForUser(userId, { limit: 5, role: "client" }),
    listPublicPilots(),
  ]);

  const activeProjects = jobRows.filter((job) =>
    ACTIVE_JOB_STATUSES.includes(job.status as JobStatus),
  ).length;

  const activeThisWeek = jobRows.filter(
    (job) =>
      ACTIVE_JOB_STATUSES.includes(job.status as JobStatus) &&
      job.createdAt >= weekAgo,
  ).length;

  const stats: ClientDashboardStat[] = [
    {
      label: "Active Projects",
      value: String(activeProjects),
      helper:
        activeThisWeek > 0
          ? `+${activeThisWeek} this week`
          : activeProjects > 0
            ? "In progress"
            : "Post your first project",
    },
    {
      label: "Quotes Received",
      value: String(quotesReceived),
      helper:
        quotesReceived > 0 ? "Awaiting review" : "No new quotes yet",
    },
    {
      label: "Projects Completed",
      value: String(completedBookings),
      helper: "Lifetime",
    },
    {
      label: "Pending Actions",
      value: String(pendingActions),
      helper: pendingActions > 0 ? "Need response" : "All caught up",
    },
  ];

  const recentProjects: ClientRecentProject[] = recentJobRows.map((job) => {
    const postedAt = job.submittedAt ?? job.createdAt;
    const hasBooking = Boolean(job.booking);
    const submittedBidCount = job._count.applications;
    const { status, statusLabel } = recentProjectStatus({
      hasBooking,
      submittedBidCount,
    });

    return {
      id: job.id,
      title: job.title,
      metadata: buildRecentProjectMetadata({
        submittedBidCount,
        postedLabel: formatClientProjectPostedLabel(postedAt.toISOString()),
        budget: formatClientProjectBudget(job),
        pilotName: job.booking?.pilotProfile.displayName,
        hasBooking,
      }),
      status,
      statusLabel,
      href: `/dashboard/client/jobs/${job.id}`,
    };
  });

  const recentActivity: ClientActivityItem[] = notifications.map(
    mapNotificationToActivity,
  );

  const recommendedPilots = publicPilots
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, 3)
    .map(mapPublicPilotToRecommended);

  return {
    clientName: profile
      ? clientFirstDisplayName(profile)
      : "Client",
    stats,
    recentProjects,
    recentActivity,
    recommendedPilots,
  };
}
