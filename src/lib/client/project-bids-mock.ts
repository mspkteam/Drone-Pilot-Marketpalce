/** Mock data for Client Project Bids — replace with bid API in M52. */

export type ClientBidStatus =
  | "Pending Review"
  | "Shortlisted"
  | "Accepted"
  | "Declined";

export type ClientBidTabId =
  | "all"
  | "pending-review"
  | "shortlisted"
  | "accepted"
  | "declined";

export type ClientProjectBid = {
  id: string;
  pilotSlug: string;
  initials: string;
  name: string;
  verified: boolean;
  rating: string;
  completedProjects: string;
  bidAmount: string;
  deliveryDays: number;
  status: ClientBidStatus;
  proposalNote: string;
  highlights: readonly string[];
};

export type ClientProjectBidSummary = {
  slug: string;
  title: string;
  location: string;
  postedLabel: string;
};

export const CLIENT_PROJECT_BID_TABS: readonly {
  id: ClientBidTabId;
  label: string;
}[] = [
  { id: "all", label: "All Bids" },
  { id: "pending-review", label: "Pending Review" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
] as const;

export const CLIENT_PROJECT_BID_SUMMARY: ClientProjectBidSummary = {
  slug: "commercial-property-survey",
  title: "Commercial Property Survey",
  location: "Dallas, TX",
  postedLabel: "Posted 2 days ago",
};

export const CLIENT_PROJECT_BIDS: readonly ClientProjectBid[] = [
  {
    id: "bid-1",
    pilotSlug: "john-smith",
    initials: "JS",
    name: "John Smith",
    verified: true,
    rating: "4.9",
    completedProjects: "120 completed projects",
    bidAmount: "$1,200",
    deliveryDays: 2,
    status: "Pending Review",
    proposalNote: "Available this week. Sub-cm survey accuracy with RTK base.",
    highlights: [
      "RTK survey accuracy",
      "Licensed operator",
      "Includes edited report",
    ],
  },
  {
    id: "bid-2",
    pilotSlug: "sarah-chen",
    initials: "SC",
    name: "Sarah Chen",
    verified: true,
    rating: "5",
    completedProjects: "87 completed projects",
    bidAmount: "$1,450",
    deliveryDays: 1,
    status: "Shortlisted",
    proposalNote: "Cinematic 6K + same-day rough cut included.",
    highlights: [
      "6K cinematic footage",
      "Same-day rough cut",
      "Event coverage specialist",
    ],
  },
  {
    id: "bid-3",
    pilotSlug: "daniel-okafor",
    initials: "DO",
    name: "Daniel Okafor",
    verified: true,
    rating: "4.8",
    completedProjects: "64 completed projects",
    bidAmount: "$980",
    deliveryDays: 3,
    status: "Pending Review",
    proposalNote: "Includes orthomosaic and PDF report.",
    highlights: [
      "Orthomosaic included",
      "PDF inspection report",
      "Best-value bid",
    ],
  },
] as const;

export const CLIENT_PROJECT_BIDS_ROUTES = {
  messages: "/dashboard/client/messages",
  pilotProfile: (slug: string) => `/pilots/${slug}` as const,
} as const;

const TAB_STATUS_MAP: Record<
  Exclude<ClientBidTabId, "all">,
  ClientBidStatus
> = {
  "pending-review": "Pending Review",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  declined: "Declined",
};

export function formatDeliveryDays(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}

export function filterClientProjectBids(
  bids: readonly ClientProjectBid[],
  tab: ClientBidTabId,
): ClientProjectBid[] {
  if (tab === "all") return [...bids];
  const status = TAB_STATUS_MAP[tab];
  return bids.filter((bid) => bid.status === status);
}

export type ClientBidBadgeTone = "gold" | "green" | "red" | "muted";

export function badgeToneForBidStatus(status: ClientBidStatus): ClientBidBadgeTone {
  switch (status) {
    case "Accepted":
      return "green";
    case "Declined":
      return "red";
    case "Shortlisted":
      return "gold";
    default:
      return "muted";
  }
}
