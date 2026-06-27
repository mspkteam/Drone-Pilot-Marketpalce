import { getJobStatusLabel, getJobStatusTone } from "@/lib/jobs/status";
import type { JobStatus } from "@/types/job";

export type ClientMyProjectTabId =
  | "all"
  | "active"
  | "awaiting-bids"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "pending";

export type ClientMyProjectBadgeTone = "gold" | "red" | "green" | "muted";

export type ClientMyProject = {
  id: string;
  title: string;
  location: string;
  postedLabel: string;
  bidsCount: number;
  budget: string;
  /** Human-readable status for the card badge */
  status: string;
  badgeTone: ClientMyProjectBadgeTone;
  jobStatus: JobStatus;
};

export const CLIENT_MY_PROJECT_TABS: readonly {
  id: ClientMyProjectTabId;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "awaiting-bids", label: "Awaiting Bids" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "pending", label: "Pending" },
] as const;

export const CLIENT_MY_PROJECTS_ROUTES = {
  newProject: "/dashboard/client/jobs/new",
  bidsHub: "/dashboard/client/quotes",
  projectDetail: (id: string) => `/dashboard/client/jobs/${id}` as const,
  projectBids: (id: string) => `/dashboard/client/quotes?jobId=${id}` as const,
} as const;

function matchesTab(jobStatus: JobStatus, tab: ClientMyProjectTabId): boolean {
  if (tab === "all") return true;

  switch (tab) {
    case "pending":
      return (
        jobStatus === "draft" ||
        jobStatus === "pending_approval" ||
        jobStatus === "rejected"
      );
    case "awaiting-bids":
      return (
        jobStatus === "approved" ||
        jobStatus === "open" ||
        jobStatus === "in_bidding"
      );
    case "in-progress":
      return jobStatus === "assigned";
    case "completed":
      return jobStatus === "closed";
    case "cancelled":
      return jobStatus === "cancelled";
    case "active":
      return !["draft", "closed", "cancelled", "rejected"].includes(jobStatus);
    default:
      return true;
  }
}

export function filterClientMyProjects(
  projects: readonly ClientMyProject[],
  tab: ClientMyProjectTabId,
): ClientMyProject[] {
  return projects.filter((project) => matchesTab(project.jobStatus, tab));
}

export function formatClientProjectPostedLabel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Posted just now";
  if (mins < 60) return `Posted ${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Posted ${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return `Posted ${new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function formatClientProjectBudget(job: {
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
}): string {
  const symbol = job.currency === "USD" ? "$" : `${job.currency} `;
  const fmt = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

  if (job.budgetMin != null && job.budgetMax != null) {
    return `${symbol}${fmt(job.budgetMin)} - ${symbol}${fmt(job.budgetMax)}`;
  }
  if (job.budgetMin != null) return `From ${symbol}${fmt(job.budgetMin)}`;
  if (job.budgetMax != null) return `Up to ${symbol}${fmt(job.budgetMax)}`;
  return "Budget TBD";
}

export function jobToClientMyProject(job: {
  id: string;
  title: string;
  locationLabel: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: string;
  status: string;
  submittedAt: Date | null;
  createdAt: Date;
  _count: { applications: number };
}): ClientMyProject {
  const jobStatus = job.status as JobStatus;
  const postedAt = job.submittedAt ?? job.createdAt;
  const tone = getJobStatusTone(jobStatus);

  return {
    id: job.id,
    title: job.title,
    location: job.locationLabel,
    postedLabel: formatClientProjectPostedLabel(postedAt.toISOString()),
    bidsCount: job._count.applications,
    budget: formatClientProjectBudget(job),
    status: getJobStatusLabel(jobStatus),
    badgeTone:
      tone === "error"
        ? "red"
        : tone === "success"
          ? "green"
          : tone === "warning"
            ? "gold"
            : "muted",
    jobStatus,
  };
}
