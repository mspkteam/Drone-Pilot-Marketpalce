import type {
  AdminDisputeCenterRow,
  DisputePriority,
} from "@/types/admin-dispute";
import type { DisputeListItemDto } from "@/types/dispute";

const MOCK_ROWS: AdminDisputeCenterRow[] = [
  {
    id: "mock-3122",
    disputeId: "DSP-3122",
    missionId: "MIS-8807",
    priority: "high",
    priorityLabel: "HIGH PRIORITY",
    title: "APEX CONSTRUCTION ↔ HANA OKAFOR",
    description:
      "Footage quality below brief. Client claims sensor interference was avoidable.",
    openedLabel: "Opened 3 hours ago",
    status: "open",
    detailHref: "/dashboard/admin/disputes",
    isMock: true,
  },
  {
    id: "mock-3118",
    disputeId: "DSP-3118",
    missionId: "MIS-8772",
    priority: "medium",
    priorityLabel: "MEDIUM PRIORITY",
    title: "LUMEN FILMS ↔ JULIAN REYES",
    description:
      "Late delivery (48h). Pilot cites severe atmospheric disruption in Sector 4.",
    openedLabel: "Opened 1 day ago",
    status: "under_review",
    detailHref: "/dashboard/admin/disputes",
    isMock: true,
  },
  {
    id: "mock-3104",
    disputeId: "DSP-3104",
    missionId: "MIS-8701",
    priority: "low",
    priorityLabel: "LOW PRIORITY",
    title: "HELIOGRID ↔ MARCUS VAUGHAN",
    description:
      "Scope change refused. Client requested additional flight paths mid-op.",
    openedLabel: "Opened 4 days ago",
    status: "open",
    detailHref: "/dashboard/admin/disputes",
    isMock: true,
  },
];

export function formatDisputeDisplayId(disputeId: string): string {
  const compact = disputeId.replace(/[^a-zA-Z0-9]/g, "");
  return `DSP-${compact.slice(-4).toUpperCase() || compact.slice(0, 4).toUpperCase()}`;
}

export function formatMissionDisplayId(jobId: string): string {
  const compact = jobId.replace(/[^a-zA-Z0-9]/g, "");
  return `MIS-${compact.slice(-4).toUpperCase() || compact.slice(0, 4).toUpperCase()}`;
}

export function assessDisputePriority(dispute: DisputeListItemDto): DisputePriority {
  if (dispute.status === "resolved") return "low";

  const ageHours =
    (Date.now() - new Date(dispute.createdAt).getTime()) / (1000 * 60 * 60);
  const amount = dispute.booking.agreedAmount;
  const reason = dispute.reason.toLowerCase();

  if (
    amount >= 1000 ||
    reason.includes("payment") ||
    reason.includes("not completed") ||
    reason.includes("refund") ||
    ageHours >= 72
  ) {
    return "high";
  }

  if (amount >= 400 || ageHours >= 24 || dispute.status === "under_review") {
    return "medium";
  }

  return "low";
}

export function formatOpenedAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (hours < 24) {
    return `Opened ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `Opened ${days} day${days === 1 ? "" : "s"} ago`;
}

export function toDisputeCenterRow(dispute: DisputeListItemDto): AdminDisputeCenterRow {
  const priority = assessDisputePriority(dispute);
  const clientName =
    dispute.booking.client.companyName ?? dispute.booking.client.contactName;

  return {
    id: dispute.id,
    disputeId: formatDisputeDisplayId(dispute.id),
    missionId: formatMissionDisplayId(dispute.booking.job.id),
    priority,
    priorityLabel: `${priority.toUpperCase()} PRIORITY`,
    title: `${clientName.toUpperCase()} ↔ ${dispute.booking.pilot.displayName.toUpperCase()}`,
    description: dispute.reason,
    openedLabel: formatOpenedAgo(dispute.createdAt),
    status: dispute.status,
    detailHref: `/dashboard/admin/disputes/${dispute.id}`,
  };
}

const PRIORITY_RANK: Record<DisputePriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortDisputeRows(
  rows: AdminDisputeCenterRow[],
  sortBy: "priority" | "newest" | "oldest",
): AdminDisputeCenterRow[] {
  const copy = [...rows];

  if (sortBy === "priority") {
    return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }

  if (sortBy === "oldest") {
    return copy.reverse();
  }

  return copy;
}

export function getMockDisputeRows(): AdminDisputeCenterRow[] {
  return MOCK_ROWS;
}
