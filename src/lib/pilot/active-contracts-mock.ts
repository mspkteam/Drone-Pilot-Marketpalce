/** Mock data for Pilot Active Contracts — replace with enriched contracts API. */

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
  bookingDetail: (bookingId: string) =>
    `/dashboard/pilot/bookings/${bookingId}` as const,
} as const;

export const PILOT_ACTIVE_CONTRACTS_MOCK: readonly PilotActiveContract[] = [
  {
    id: "mock-contract-4421",
    contractId: "C-4421",
    title: "Wind Farm Quarterly Survey",
    client: "Northwind Energy",
    deadline: "12d",
    value: "$8,400",
    status: "On Track",
    deliverHref: PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4421"),
    messageHref: PILOT_ACTIVE_CONTRACTS_ROUTES.messages,
    disputeHref: `${PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4421")}#dispute`,
  },
  {
    id: "mock-contract-4418",
    contractId: "C-4418",
    title: "Highway Bridge Inspection",
    client: "DoT Region 4",
    deadline: "4d",
    value: "$3,200",
    status: "Due Soon",
    deliverHref: PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4418"),
    messageHref: PILOT_ACTIVE_CONTRACTS_ROUTES.messages,
    disputeHref: `${PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4418")}#dispute`,
  },
  {
    id: "mock-contract-4410",
    contractId: "C-4410",
    title: "Real Estate Monthly Capture",
    client: "Pinnacle Realty",
    deadline: "Recurring",
    value: "$1,400 / mo",
    status: "On Track",
    deliverHref: PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4410"),
    messageHref: PILOT_ACTIVE_CONTRACTS_ROUTES.messages,
    disputeHref: `${PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4410")}#dispute`,
  },
  {
    id: "mock-contract-4408",
    contractId: "C-4408",
    title: "Construction Site Progress Mapping",
    client: "Atlas Developments",
    deadline: "9d",
    value: "$2,750",
    status: "On Track",
    deliverHref: PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4408"),
    messageHref: PILOT_ACTIVE_CONTRACTS_ROUTES.messages,
    disputeHref: `${PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4408")}#dispute`,
  },
  {
    id: "mock-contract-4397",
    contractId: "C-4397",
    title: "Thermal Roof Inspection",
    client: "Civic Property Group",
    deadline: "2d",
    value: "$950",
    status: "Due Soon",
    deliverHref: PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4397"),
    messageHref: PILOT_ACTIVE_CONTRACTS_ROUTES.messages,
    disputeHref: `${PILOT_ACTIVE_CONTRACTS_ROUTES.bookingDetail("mock-contract-4397")}#dispute`,
  },
] as const;

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
