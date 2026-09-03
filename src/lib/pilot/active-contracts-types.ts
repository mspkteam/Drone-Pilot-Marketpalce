/** Shared types and helpers for Pilot Active Contracts. */

import type { ContractAction } from "@/lib/bookings/contract-actions";

export type PilotContractUiStatus =
  | "Pending"
  | "Ready to start"
  | "On Track"
  | "Due Soon"
  | "Awaiting review"
  | "Revisions requested"
  | "Disputed"
  | "Completed"
  | "Cancelled";

export type PilotContractTabId =
  | "all"
  | "on-track"
  | "due-soon"
  | "awaiting-review"
  | "revisions"
  | "disputed"
  | "completed";

export type PilotActiveContract = {
  id: string;
  contractId: string;
  title: string;
  client: string;
  deadline: string;
  value: string;
  status: PilotContractUiStatus;
  detailHref: string;
  deliverHref: string;
  messageHref: string;
  disputeHref: string;
  actions: ContractAction[];
};

export const PILOT_ACTIVE_CONTRACT_TABS: readonly {
  id: PilotContractTabId;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "on-track", label: "On Track" },
  { id: "due-soon", label: "Due Soon" },
  { id: "awaiting-review", label: "Awaiting Review" },
  { id: "revisions", label: "Revisions" },
  { id: "disputed", label: "Disputed" },
  { id: "completed", label: "Completed" },
] as const;

export const PILOT_ACTIVE_CONTRACTS_ROUTES = {
  browseJobs: "/dashboard/pilot/jobs",
  messages: "/dashboard/pilot/messages",
  conversation: (conversationId: string) =>
    `/dashboard/pilot/messages/${conversationId}` as const,
  bookingDetail: (bookingId: string) =>
    `/dashboard/pilot/bookings/${bookingId}` as const,
} as const;

const TAB_STATUS_MAP: Record<
  Exclude<PilotContractTabId, "all">,
  PilotContractUiStatus
> = {
  "on-track": "On Track",
  "due-soon": "Due Soon",
  "awaiting-review": "Awaiting review",
  revisions: "Revisions requested",
  disputed: "Disputed",
  completed: "Completed",
};

export function filterPilotActiveContracts(
  contracts: readonly PilotActiveContract[],
  tab: PilotContractTabId,
): PilotActiveContract[] {
  if (tab === "all") return [...contracts];
  if (tab === "on-track") {
    return contracts.filter(
      (contract) =>
        contract.status === "On Track" ||
        contract.status === "Ready to start" ||
        contract.status === "Pending",
    );
  }
  const status = TAB_STATUS_MAP[tab];
  return contracts.filter((contract) => contract.status === status);
}

export type PilotContractBadgeTone = "gold" | "red" | "green" | "muted";

export function badgeToneForContractStatus(
  status: PilotContractUiStatus,
): PilotContractBadgeTone {
  switch (status) {
    case "Disputed":
    case "Cancelled":
      return "red";
    case "Completed":
    case "On Track":
    case "Ready to start":
      return "green";
    case "Due Soon":
    case "Awaiting review":
    case "Revisions requested":
      return "gold";
    case "Pending":
    default:
      return "muted";
  }
}
