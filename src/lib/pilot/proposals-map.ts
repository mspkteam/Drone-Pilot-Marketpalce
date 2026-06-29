import type { ApplicationStatus, PilotApplicationListItemDto } from "@/types/application";

export type PilotProposalUiStatus =
  | "PENDING"
  | "REVISED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

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

export const PILOT_PROPOSAL_TAB_ORDER: readonly PilotProposalUiStatus[] = [
  "PENDING",
  "REVISED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

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
  if (status === "REVISED") return "Shortlisted";
  return status.charAt(0) + status.slice(1).toLowerCase();
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
): Record<PilotProposalUiStatus, number> {
  return PILOT_PROPOSAL_TAB_ORDER.reduce(
    (acc, status) => {
      acc[status] = rows.filter((row) => row.status === status).length;
      return acc;
    },
    {} as Record<PilotProposalUiStatus, number>,
  );
}
