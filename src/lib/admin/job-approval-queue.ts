import { listJobsForAdmin } from "@/lib/jobs/admin";
import { prisma } from "@/lib/db";
import type { AdminJobDto } from "@/types/admin-job";
import type {
  JobApprovalQueueData,
  JobApprovalQueueRow,
  JobApprovalStatCard,
  JobRiskLevel,
} from "@/types/admin-job-approval";

const MOCK_ROWS: JobApprovalQueueRow[] = [
  {
    id: "mock-8842",
    missionId: "MISSION-8842",
    title: "SOLAR FARM THERMAL SURVEY",
    postedBy: "HELIOGRID ENERGY",
    location: "NEVADA, US",
    budget: "$4,800",
    riskLevel: "low",
    riskLabel: "LOW RISK",
    isNightOp: false,
    reviewHref: "/dashboard/admin/jobs",
  },
  {
    id: "mock-8841",
    missionId: "MISSION-8841",
    title: "COASTAL CLIFF INSPECTION",
    postedBy: "ATLANTIC SURVEY CO.",
    location: "CORNWALL, UK",
    budget: "$2,150",
    riskLevel: "medium",
    riskLabel: "MEDIUM RISK",
    isNightOp: false,
    reviewHref: "/dashboard/admin/jobs",
  },
  {
    id: "mock-8840",
    missionId: "MISSION-8840",
    title: "STADIUM ROOF MAPPING (NIGHT)",
    postedBy: "APEX CONSTRUCTION",
    location: "BERLIN, DE",
    budget: "$8,400",
    riskLevel: "high",
    riskLabel: "HIGH RISK",
    isNightOp: true,
    reviewHref: "/dashboard/admin/jobs",
  },
  {
    id: "mock-8839",
    missionId: "MISSION-8839",
    title: "WEDDING AERIAL COVERAGE",
    postedBy: "LUMEN FILMS",
    location: "TUSCANY, IT",
    budget: "$1,200",
    riskLevel: "low",
    riskLabel: "LOW RISK",
    isNightOp: false,
    reviewHref: "/dashboard/admin/jobs",
  },
];

function assessJobRisk(job: AdminJobDto): {
  level: JobRiskLevel;
  label: string;
  isNightOp: boolean;
} {
  const title = job.title.toLowerCase();
  const requirements = (job.requirements ?? "").toLowerCase();
  const budget = job.budgetMax ?? job.budgetMin ?? 0;
  const isNightOp = title.includes("night") || requirements.includes("night");

  let level: JobRiskLevel = "low";
  if (
    budget >= 6000 ||
    isNightOp ||
    (job.category === "inspection" && budget >= 4000)
  ) {
    level = "high";
  } else if (budget >= 2000 || job.category === "inspection") {
    level = "medium";
  }

  const label =
    level === "high" ? "HIGH RISK" : level === "medium" ? "MEDIUM RISK" : "LOW RISK";

  return { level, label, isNightOp };
}

function formatBudget(job: AdminJobDto): string {
  const amount = job.budgetMax ?? job.budgetMin;
  if (amount == null) return "—";
  return `$${Math.round(amount).toLocaleString()}`;
}

function formatPostedBy(job: AdminJobDto): string {
  return (job.client.companyName ?? job.client.contactName).toUpperCase();
}

function formatLocation(job: AdminJobDto): string {
  const parts = [job.locationCity, job.locationRegion, job.locationCountry]
    .filter(Boolean)
    .join(", ");
  return (parts || job.locationLabel).toUpperCase();
}

function toQueueRow(job: AdminJobDto): JobApprovalQueueRow {
  const risk = assessJobRisk(job);
  return {
    id: job.id,
    missionId: `MISSION-${job.id.slice(-4).toUpperCase()}`,
    title: job.title.toUpperCase(),
    postedBy: formatPostedBy(job),
    location: formatLocation(job),
    budget: formatBudget(job),
    riskLevel: risk.level,
    riskLabel: risk.label,
    isNightOp: risk.isNightOp,
    reviewHref: `/dashboard/admin/jobs/${job.id}`,
  };
}

async function buildStats(
  pendingRows: JobApprovalQueueRow[],
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

  const highRiskCount = pendingRows.filter((r) => r.riskLevel === "high").length;
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
  const avgMinutes = avgMs != null ? Math.round(avgMs / 60000) : 42;

  const approvedDelta = approvedToday - approvedYesterday;
  const approvedSubtext =
    approvedDelta >= 0
      ? `+${approvedDelta} vs yesterday`
      : `${approvedDelta} vs yesterday`;

  return [
    {
      label: "AWAITING REVIEW",
      value: String(pendingRows.length),
      subtext:
        highRiskCount > 0
          ? `${highRiskCount} flagged high-risk`
          : "No high-risk flags",
      tone: "gold",
    },
    {
      label: "APPROVED TODAY",
      value: String(approvedToday),
      subtext: approvedSubtext,
      tone: "success",
    },
    {
      label: "AVG. APPROVAL TIME",
      value: `${avgMinutes}M`,
      subtext: "under SLA",
      tone: "neutral",
    },
    {
      label: "REJECTED (7D)",
      value: String(rejected7d),
      subtext: "policy violations",
      tone: "danger",
    },
  ];
}

export async function getJobApprovalQueueData(): Promise<JobApprovalQueueData> {
  const pendingJobs = await listJobsForAdmin("pending_approval");
  const rows = pendingJobs.map(toQueueRow);
  const stats = await buildStats(rows);

  if (rows.length === 0) {
    const mockStats = await buildStats(MOCK_ROWS);
    return {
      stats: mockStats.map((card, index) =>
        index === 0
          ? {
              ...card,
              value: String(MOCK_ROWS.length),
              subtext: "2 flagged high-risk",
            }
          : card,
      ),
      rows: MOCK_ROWS,
      totalPending: 9,
      usingMockRows: true,
    };
  }

  return {
    stats,
    rows,
    totalPending: rows.length,
    usingMockRows: false,
  };
}
