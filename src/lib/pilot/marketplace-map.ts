import { formatJobBudget } from "@/lib/jobs/format-budget";
import { JOB_CATEGORIES } from "@/types/job";
import type { PilotOpenJobDto } from "@/types/application";

export type PilotMissionCard = {
  id: string;
  initials: string;
  category: string;
  title: string;
  clientName: string;
  rating: string;
  location: string;
  deadline: string;
  budget: string;
  license: string;
  href: string;
  hasApplied: boolean;
  canApply: boolean;
  searchText: string;
};

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
  }
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "CL";
}

function categoryLabel(id: string): string {
  return (
    JOB_CATEGORIES.find((c) => c.id === id)?.label.toUpperCase() ?? id.toUpperCase()
  );
}

function formatDeadline(iso: string | null): string {
  if (!iso) return "FLEXIBLE · TBD";
  const d = new Date(iso);
  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = d
    .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const mins = d.getUTCMinutes().toString().padStart(2, "0");
  return `${day} ${month} · ${hours}:${mins}Z`;
}

function formatBudgetDisplay(job: PilotOpenJobDto): string {
  const raw = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);
  if (!raw) return "OPEN";
  const match = raw.match(/[\d,]+(?:\.\d+)?/g);
  if (!match?.length) return raw;
  const amount = match[match.length - 1]!.replace(/,/g, "");
  const num = Number(amount);
  if (!Number.isFinite(num)) return raw;
  return `$${num.toLocaleString()}`;
}

function licenseFromRequirements(requirements: string | null): string {
  const trimmed = requirements?.trim();
  if (!trimmed) return "FAA Part 107 + BVLOS";
  const firstLine = trimmed.split("\n")[0]?.trim();
  if (!firstLine) return "FAA Part 107 + BVLOS";
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
}

export function mapOpenJobToMissionCard(job: PilotOpenJobDto): PilotMissionCard {
  const category = categoryLabel(job.category);
  const clientName = job.clientDisplayName;
  const license = licenseFromRequirements(job.requirements);

  return {
    id: job.id,
    initials: initialsFromName(clientName),
    category,
    title: job.title,
    clientName,
    rating: "4.9",
    location: job.locationLabel,
    deadline: formatDeadline(job.scheduledDate),
    budget: formatBudgetDisplay(job),
    license,
    href: `/dashboard/pilot/jobs/${job.id}`,
    hasApplied: job.hasApplied,
    canApply: job.canApply,
    searchText: [
      job.title,
      clientName,
      category,
      job.locationLabel,
      license,
      job.description,
    ]
      .join(" ")
      .toLowerCase(),
  };
}

export function filterMissionCards(
  cards: PilotMissionCard[],
  query: string,
): PilotMissionCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return cards;
  return cards.filter((card) => card.searchText.includes(q));
}
