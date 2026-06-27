import type { PilotServiceId } from "@/types/pilot";

export type CaptainClubBadge = "captain" | "verified" | "certified" | "insured";

export type CaptainClubPilot = {
  id: string;
  initials: string;
  name: string;
  location: string;
  regionGroup: string;
  rating: number | null;
  ratingLabel: string;
  reviewCount: number;
  bio: string | null;
  badges: readonly CaptainClubBadge[];
  tierLabel: string;
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
  | "most_reviews";

export const CAPTAIN_SORT_OPTIONS: readonly {
  id: CaptainSortOption;
  label: string;
}[] = [
  { id: "highest_rated", label: "Sort By: Highest Rated" },
  { id: "name_asc", label: "Sort By: Name (A–Z)" },
  { id: "name_desc", label: "Sort By: Name (Z–A)" },
  { id: "most_reviews", label: "Sort By: Most Reviews" },
] as const;

export const CAPTAIN_DIRECTORY_PAGE_SIZE = 8;
