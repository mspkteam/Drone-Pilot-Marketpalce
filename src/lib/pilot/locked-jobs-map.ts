import { formatJobBudget } from "@/lib/jobs/format-budget";
import { JOB_CATEGORIES } from "@/types/job";
import type { PilotLockedJobDto } from "@/types/application";

export type PilotLockedJobCard = {
  id: string;
  title: string;
  budget: string;
  reason: string;
  unlockAt: string;
  requirement: string;
};

function formatBudgetDisplay(job: PilotLockedJobDto): string {
  const raw = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);
  if (!raw) return "OPEN";
  const match = raw.match(/[\d,]+(?:\.\d+)?/g);
  if (!match?.length) return raw;
  const amount = match[match.length - 1]!.replace(/,/g, "");
  const num = Number(amount);
  if (!Number.isFinite(num)) return raw;
  return `$${num.toLocaleString()}`;
}

function reasonFromRequirements(requirements: string | null): string {
  const trimmed = requirements?.trim();
  if (!trimmed) return "Tier visibility delay";
  const first = trimmed.split("\n")[0]?.trim();
  if (!first) return "Tier visibility delay";
  if (first.toLowerCase().startsWith("reason:")) {
    return first.slice(7).trim();
  }
  return first.length > 80 ? `${first.slice(0, 77)}…` : first;
}

function requirementFromJob(job: PilotLockedJobDto): string {
  const category = JOB_CATEGORIES.find((c) => c.id === job.category);
  if (category) {
    return `${category.label.toUpperCase()} CLEARANCE`;
  }
  if (job.jobVisibilityDelayHours > 0) {
    return `TIER DELAY · ${job.jobVisibilityDelayHours}H`;
  }
  return "MEMBERSHIP UPGRADE";
}

export function mapLockedJobToCard(job: PilotLockedJobDto): PilotLockedJobCard {
  return {
    id: job.id,
    title: job.title,
    budget: formatBudgetDisplay(job),
    reason: reasonFromRequirements(job.requirements),
    unlockAt: job.visibleAt,
    requirement: requirementFromJob(job),
  };
}
