import { listJobsForAdmin } from "@/lib/jobs/admin";
import { prisma } from "@/lib/db";
import {
  isJobApprovalStatusFilter,
  mapAdminJobToQueueRow,
} from "@/lib/admin/job-approval-queue-map";
import type { AdminJobDto } from "@/types/admin-job";
import type {
  JobApprovalQueueData,
  JobApprovalStatCard,
  JobApprovalStatusFilter,
} from "@/types/admin-job-approval";

export {
  isJobApprovalStatusFilter,
  mapAdminJobToQueueRow,
} from "@/lib/admin/job-approval-queue-map";

const QUEUE_STATUSES = ["pending_approval", "open", "rejected"] as const;

async function listJobsForQueue(
  statusFilter: JobApprovalStatusFilter,
): Promise<AdminJobDto[]> {
  if (statusFilter === "all") {
    const jobs = await listJobsForAdmin("all");
    return jobs.filter((job) =>
      (QUEUE_STATUSES as readonly string[]).includes(job.status),
    );
  }
  return listJobsForAdmin(statusFilter);
}

async function buildStats(
  pendingCount: number,
  highRiskPending: number,
): Promise<JobApprovalStatCard[]> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [approvedToday, approvedYesterday, rejected7d, recentApprovals] =
    await Promise.all([
      prisma.job.count({
        where: { approvedAt: { gte: startOfToday } },
      }),
      prisma.job.count({
        where: {
          approvedAt: { gte: startOfYesterday, lt: startOfToday },
        },
      }),
      prisma.job.count({
        where: {
          status: "rejected",
          updatedAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.job.findMany({
        where: {
          approvedAt: { not: null },
          submittedAt: { not: null },
        },
        select: { approvedAt: true, submittedAt: true },
        orderBy: { approvedAt: "desc" },
        take: 50,
      }),
    ]);

  const approvalDeltas = recentApprovals
    .map((job) => {
      if (!job.approvedAt || !job.submittedAt) return null;
      return job.approvedAt.getTime() - job.submittedAt.getTime();
    })
    .filter((v): v is number => v != null);

  const avgMs =
    approvalDeltas.length > 0
      ? approvalDeltas.reduce((sum, v) => sum + v, 0) / approvalDeltas.length
      : null;
  const avgMinutes = avgMs != null ? Math.round(avgMs / 60000) : 0;

  const approvedDelta = approvedToday - approvedYesterday;
  const approvedSubtext =
    approvedDelta >= 0
      ? `+${approvedDelta} vs yesterday`
      : `${approvedDelta} vs yesterday`;

  return [
    {
      label: "AWAITING REVIEW",
      value: String(pendingCount),
      subtext:
        highRiskPending > 0
          ? `${highRiskPending} flagged high-risk`
          : "No high-risk flags",
      tone: "gold",
      statusFilter: "pending_approval",
    },
    {
      label: "APPROVED TODAY",
      value: String(approvedToday),
      subtext: approvedSubtext,
      tone: "success",
      statusFilter: "open",
    },
    {
      label: "AVG. APPROVAL TIME",
      value: avgMinutes > 0 ? `${avgMinutes}M` : "—",
      subtext: avgMinutes > 0 ? "under SLA" : "no approvals yet",
      tone: "neutral",
    },
    {
      label: "REJECTED (7D)",
      value: String(rejected7d),
      subtext: "policy violations",
      tone: "danger",
      statusFilter: "rejected",
    },
  ];
}

export async function getJobApprovalQueueData(
  statusFilter: JobApprovalStatusFilter = "pending_approval",
): Promise<JobApprovalQueueData> {
  const [jobs, pendingJobs] = await Promise.all([
    listJobsForQueue(statusFilter),
    statusFilter === "pending_approval"
      ? null
      : listJobsForAdmin("pending_approval"),
  ]);

  const rows = jobs.map(mapAdminJobToQueueRow);
  const pendingRows =
    statusFilter === "pending_approval"
      ? rows
      : (pendingJobs ?? []).map(mapAdminJobToQueueRow);
  const highRiskPending = pendingRows.filter((r) => r.riskLevel === "high").length;
  const stats = await buildStats(pendingRows.length, highRiskPending);

  return {
    stats,
    rows,
    totalPending: pendingRows.length,
    totalMatching: rows.length,
    statusFilter,
    usingMockRows: false,
  };
}
