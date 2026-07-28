import type { AdminJobDto } from "@/types/admin-job";
import type {
  JobApprovalQueueRow,
  JobApprovalStatusFilter,
  JobRiskLevel,
} from "@/types/admin-job-approval";

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

function statusLabelFor(status: string): string {
  switch (status) {
    case "pending_approval":
      return "AWAITING REVIEW";
    case "open":
      return "APPROVED";
    case "rejected":
      return "REJECTED";
    default:
      return status.replace(/_/g, " ").toUpperCase();
  }
}

export function mapAdminJobToQueueRow(job: AdminJobDto): JobApprovalQueueRow {
  const risk = assessJobRisk(job);
  return {
    id: job.id,
    missionId: `MISSION-${job.id.slice(-4).toUpperCase()}`,
    title: job.title.toUpperCase(),
    postedBy: formatPostedBy(job),
    location: formatLocation(job),
    budget: formatBudget(job),
    status: job.status,
    statusLabel: statusLabelFor(job.status),
    riskLevel: risk.level,
    riskLabel: risk.label,
    isNightOp: risk.isNightOp,
    reviewHref: `/dashboard/admin/jobs/${job.id}`,
  };
}

export function isJobApprovalStatusFilter(
  value: string | null | undefined,
): value is JobApprovalStatusFilter {
  return (
    value === "all" ||
    value === "pending_approval" ||
    value === "open" ||
    value === "rejected"
  );
}
