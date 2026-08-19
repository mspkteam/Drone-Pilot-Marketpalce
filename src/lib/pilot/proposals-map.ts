import type { ApplicationStatus, PilotApplicationListItemDto } from "@/types/application";

export type PilotProposalUiStatus =
  | "PENDING"
  | "REVISED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export type PilotProposalTabId = "ALL" | PilotProposalUiStatus;

export type PilotProposalRow = {
  id: string;
  displayId: string;
  mission: string;
  client: string;
  bid: string;
  sent: string;
  status: PilotProposalUiStatus;
  badgeLabel: string;
  viewHref: string;
};

export const PILOT_PROPOSAL_TAB_ORDER: readonly PilotProposalTabId[] = [
  "ALL",
  "PENDING",
  "REVISED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

const TAB_LABELS: Record<PilotProposalTabId, string> = {
  ALL: "All",
  PENDING: "Pending",
  REVISED: "Revised",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export function proposalTabLabel(tab: PilotProposalTabId): string {
  return TAB_LABELS[tab];
}

export function isProposalTabId(value: string | null | undefined): value is PilotProposalTabId {
  return Boolean(value && (PILOT_PROPOSAL_TAB_ORDER as readonly string[]).includes(value));
}

export function mapApplicationStatusToUi(
  status: ApplicationStatus,
  shortlistedAt: string | null,
): PilotProposalUiStatus {
  switch (status) {
    case "accepted":
      return "ACCEPTED";
    case "rejected":
    case "expired":
      return "REJECTED";
    case "withdrawn":
      return "WITHDRAWN";
    case "submitted":
    default:
      return shortlistedAt ? "REVISED" : "PENDING";
  }
}

export function proposalBadgeLabel(
  status: PilotProposalUiStatus,
): string {
  if (status === "REVISED") return "SHORTLISTED";
  return status;
}

function formatProposalId(applicationId: string): string {
  const suffix = applicationId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  return `#${suffix || "0000"}`;
}

function formatBid(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatSentAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function mapApplicationToProposalRow(
  app: PilotApplicationListItemDto,
): PilotProposalRow {
  return {
    id: app.id,
    displayId: formatProposalId(app.id),
    mission: app.job.title,
    client: app.job.clientDisplayName,
    bid: formatBid(app.proposedAmount, app.currency),
    sent: formatSentAgo(app.submittedAt),
    status: mapApplicationStatusToUi(app.status, app.shortlistedAt),
    badgeLabel: proposalBadgeLabel(
      mapApplicationStatusToUi(app.status, app.shortlistedAt),
    ),
    viewHref: `/dashboard/pilot/proposals/${app.id}`,
  };
}

export function countProposalsByStatus(
  rows: PilotProposalRow[],
): Record<PilotProposalTabId, number> {
  const counts: Record<PilotProposalTabId, number> = {
    ALL: rows.length,
    PENDING: 0,
    REVISED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };
  for (const row of rows) {
    counts[row.status] += 1;
  }
  return counts;
}

export function filterProposalsByTab(
  rows: readonly PilotProposalRow[],
  tab: PilotProposalTabId,
): PilotProposalRow[] {
  if (tab === "ALL") return [...rows];
  return rows.filter((row) => row.status === tab);
}
