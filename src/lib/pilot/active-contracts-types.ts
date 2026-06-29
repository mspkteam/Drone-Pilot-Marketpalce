/** Shared types and helpers for Pilot Active Contracts. */

export type PilotContractUiStatus =
  | "On Track"
  | "Due Soon"
  | "Recurring"
  | "Disputed"
  | "Completed";

export type PilotContractTabId =
  | "all"
  | "on-track"
  | "due-soon"
  | "recurring"
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
  deliverHref: string;
  messageHref: string;
  disputeHref: string;
};

export const PILOT_ACTIVE_CONTRACT_TABS: readonly {
  id: PilotContractTabId;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "on-track", label: "On Track" },
  { id: "due-soon", label: "Due Soon" },
  { id: "recurring", label: "Recurring" },
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
  recurring: "Recurring",
  disputed: "Disputed",
  completed: "Completed",
};

export function filterPilotActiveContracts(
  contracts: readonly PilotActiveContract[],
  tab: PilotContractTabId,
): PilotActiveContract[] {
  if (tab === "all") return [...contracts];
  const status = TAB_STATUS_MAP[tab];
  return contracts.filter((contract) => contract.status === status);
}

export type PilotContractBadgeTone = "gold" | "red" | "green" | "muted";

export function badgeToneForContractStatus(
  status: PilotContractUiStatus,
): PilotContractBadgeTone {
  switch (status) {
    case "Disputed":
      return "red";
    case "Completed":
    case "On Track":
      return "green";
    case "Due Soon":
      return "gold";
    case "Recurring":
      return "muted";
    default:
      return "muted";
  }
}
