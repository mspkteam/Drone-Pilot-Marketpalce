import type { ApplicationStatus } from "@/types/application";
import type { ClientJobApplicationDto } from "@/types/booking";
import {
  getPublicPilotRatingTag,
  MIN_REVIEWS_FOR_PUBLIC_RATING,
} from "@/lib/reviews/public-rating";

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
  applicationId: string;
  jobId: string;
  pilotProfileId: string;
  initials: string;
  name: string;
  verified: boolean;
  reviewCount: number;
  rating: string | null;
  ratingLabel: string;
  completedProjects: string;
  bidAmount: string;
  deliveryDays: number | null;
  status: ClientBidStatus;
  applicationStatus: ApplicationStatus;
  proposalNote: string;
  highlights: readonly string[];
};

export type ClientProjectBidSummary = {
  jobId: string;
  title: string;
  location: string;
  postedLabel: string;
};

export type ClientProjectJobOption = {
  id: string;
  title: string;
  bidCount: number;
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

export const CLIENT_PROJECT_BIDS_COPY = {
  title: "Project Quotes",
  subtitle: "Compare pilot offers before making your decision.",
  emptyProjectsTitle: "No projects to review",
  emptyProjectsText:
    "Post a project and submit it for approval to start receiving quotes.",
  emptyBidsTitle: "No quotes found",
  emptyBidsText:
    "Pilots can submit quotes once your project is approved and open on the marketplace.",
} as const;

export const CLIENT_PROJECT_BIDS_ROUTES = {
  hub: (jobId?: string) =>
    jobId
      ? (`/dashboard/client/quotes?jobId=${jobId}` as const)
      : ("/dashboard/client/quotes" as const),
  messages: "/dashboard/client/messages",
  pilotProfile: (pilotProfileId: string) => `/pilots/${pilotProfileId}` as const,
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

export function formatDeliveryDays(days: number | null): string {
  if (days == null) return "TBD";
  return days === 1 ? "1 day" : `${days} days`;
}

export function applicationStatusToBidStatus(
  status: ApplicationStatus,
  shortlisted: boolean,
): ClientBidStatus {
  if (shortlisted && status === "submitted") return "Shortlisted";
  switch (status) {
    case "accepted":
      return "Accepted";
    case "rejected":
    case "withdrawn":
    case "expired":
      return "Declined";
    case "submitted":
    default:
      return "Pending Review";
  }
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

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatBidAmount(amount: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function deliveryDaysFrom(iso: string | null): number | null {
  if (!iso) return null;
  const diffMs = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diffMs / 86400000);
  return Math.max(1, days);
}

function highlightsFromMessage(message: string | null): readonly string[] {
  if (!message?.trim()) return [];
  const lines = message
    .split(/\n|•|·|-/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length <= 80);
  if (lines.length <= 1) return [];
  return lines.slice(0, 3);
}

export function mapOfferToProjectBid(
  offer: ClientJobApplicationDto,
): ClientProjectBid {
  const shortlisted = Boolean(offer.shortlistedAt);
  const reviewCount = offer.pilot.reviewCount ?? 0;
  const averageRating = offer.pilot.averageRating ?? null;
  const ratingLabel = getPublicPilotRatingTag(reviewCount, averageRating);
  const rating =
    reviewCount >= MIN_REVIEWS_FOR_PUBLIC_RATING && averageRating != null
      ? averageRating.toFixed(1)
      : null;

  const completed = offer.pilot.completedBookings ?? 0;
  const applicationStatus = offer.status as ApplicationStatus;

  return {
    id: offer.id,
    applicationId: offer.id,
    jobId: offer.jobId,
    pilotProfileId: offer.pilotProfileId,
    initials: initialsFromName(offer.pilot.displayName),
    name: offer.pilot.displayName,
    verified: offer.pilot.verified ?? false,
    reviewCount,
    rating,
    ratingLabel,
    completedProjects:
      completed === 1
        ? "1 completed project"
        : `${completed} completed projects`,
    bidAmount: formatBidAmount(offer.proposedAmount, offer.currency),
    deliveryDays: deliveryDaysFrom(offer.estimatedDeliveryDate),
    status: applicationStatusToBidStatus(applicationStatus, shortlisted),
    applicationStatus,
    proposalNote: offer.message?.trim() || "No proposal message provided.",
    highlights: highlightsFromMessage(offer.message),
  };
}

export function applyShortlistToBids(
  bids: readonly ClientProjectBid[],
  shortlistedIds: ReadonlySet<string>,
): ClientProjectBid[] {
  return bids.map((bid) => {
    const shortlisted = shortlistedIds.has(bid.id);
    if (bid.applicationStatus !== "submitted") return bid;
    return {
      ...bid,
      status: applicationStatusToBidStatus(bid.applicationStatus, shortlisted),
    };
  });
}
