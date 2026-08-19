import type { PilotServiceId } from "@/types/pilot";

export type CaptainClubBadge = "captain" | "verified" | "certified" | "insured";

export type CaptainClubPilot = {
  id: string;
  initials: string;
  avatarUrl: string | null;
  name: string;
  /** Last token of displayName for last-name sorts. */
  lastName: string;
  /** Formatted 6-digit RAS member number when available. */
  memberNumber: string | null;
  location: string;
  regionGroup: string;
  rating: number | null;
  ratingLabel: string;
  reviewCount: number;
  bio: string | null;
  badges: readonly CaptainClubBadge[];
  tierLabel: string;
  tierCode: string;
  /** Highest-rarity awarded wing name; empty when none. */
  wingTypeLabel: string;
  /** Sort key: rarity rank (higher first) + wing name. */
  wingSortKey: string;
  serviceIds: readonly PilotServiceId[];
  specialtyLabels: readonly string[];
  profileHref: string;
};

export type CaptainClubStats = {
  activeCaptains: number;
  verifiedProfilesLabel: string;
  regionsCovered: number;
  averageRatingLabel: string;
};

export type CaptainSortOption =
  | "highest_rated"
  | "name_asc"
  | "name_desc"
  | "most_reviews"
  | "member_number"
  | "last_name_asc"
  | "last_name_desc"
  | "wing_type";

export const CAPTAIN_SORT_OPTIONS: readonly {
  id: CaptainSortOption;
  label: string;
}[] = [
  { id: "highest_rated", label: "Sort By: Highest Rated" },
  { id: "name_asc", label: "Sort By: Name (A–Z)" },
  { id: "name_desc", label: "Sort By: Name (Z–A)" },
  { id: "last_name_asc", label: "Sort By: Last Name (A–Z)" },
  { id: "last_name_desc", label: "Sort By: Last Name (Z–A)" },
  { id: "member_number", label: "Sort By: Member Number" },
  { id: "wing_type", label: "Sort By: Wing Type Awarded" },
  { id: "most_reviews", label: "Sort By: Most Reviews" },
] as const;

export const CAPTAIN_DIRECTORY_PAGE_SIZE = 8;
