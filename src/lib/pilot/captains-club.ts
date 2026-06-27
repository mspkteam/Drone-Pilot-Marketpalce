import { PILOT_SERVICE_OPTIONS, type PilotServiceId } from "@/types/pilot";
import type {
  CaptainClubPilot,
  CaptainClubStats,
  CaptainSortOption,
} from "@/types/captains-club";

const EU_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "CH",
  "DE",
  "DK",
  "ES",
  "FI",
  "FR",
  "GB",
  "IE",
  "IT",
  "NL",
  "NO",
  "PL",
  "PT",
  "SE",
]);

export function regionGroupForCountry(country: string | null | undefined): string {
  const code = country?.trim().toUpperCase();
  if (!code) return "Other";
  if (code === "US" || code === "CA" || code === "MX") return "North America";
  if (EU_COUNTRY_CODES.has(code)) return "Western Europe";
  return "Other";
}

function badgeLabel(badge: CaptainClubPilot["badges"][number]): string {
  switch (badge) {
    case "captain":
      return "A-6 CAPTAIN";
    case "verified":
      return "VERIFIED";
    case "certified":
      return "CERTIFIED";
    case "insured":
      return "INSURED";
    default:
      return badge;
  }
}

export function getCaptainBadgeLabel(badge: CaptainClubPilot["badges"][number]): string {
  return badgeLabel(badge);
}

export function filterCaptainsClub(
  captains: readonly CaptainClubPilot[],
  query: string,
  region: string | null,
  specialty: PilotServiceId | null,
): CaptainClubPilot[] {
  const normalizedQuery = query.trim().toLowerCase();

  return captains.filter((captain) => {
    if (region && region !== "all" && captain.regionGroup !== region) {
      return false;
    }

    if (specialty && !captain.serviceIds.includes(specialty)) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchable = [
      captain.name,
      captain.location,
      captain.bio ?? "",
      ...captain.specialtyLabels,
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}

export function sortCaptainsClub(
  captains: readonly CaptainClubPilot[],
  sortBy: CaptainSortOption,
): CaptainClubPilot[] {
  const sorted = [...captains];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "most_reviews":
        return b.reviewCount - a.reviewCount;
      case "highest_rated":
      default: {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return b.reviewCount - a.reviewCount;
      }
    }
  });

  return sorted;
}

export function buildCaptainClubStats(captains: readonly CaptainClubPilot[]): CaptainClubStats {
  const ratings = captains
    .map((captain) => captain.rating)
    .filter((rating): rating is number => rating != null);

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : null;

  const roundedAverage =
    avgRating != null ? Math.round(avgRating * 10) / 10 : null;

  const verifiedCount = captains.filter((captain) =>
    captain.badges.includes("verified"),
  ).length;

  const regions = new Set(
    captains
      .map((captain) => captain.regionGroup)
      .filter((region) => region !== "Other"),
  );

  return {
    activeCaptains: captains.length,
    verifiedProfilesLabel:
      captains.length === 0
        ? "—"
        : verifiedCount === captains.length
          ? "100%"
          : `${Math.round((verifiedCount / captains.length) * 100)}%`,
    regionsCovered: regions.size,
    averageRatingLabel:
      roundedAverage != null ? `${roundedAverage.toFixed(1)}/5` : "New",
  };
}

export function specialtyOptionsFromCaptains(
  captains: readonly CaptainClubPilot[],
): { id: PilotServiceId; label: string }[] {
  const specialtyIds = new Set<PilotServiceId>();
  for (const captain of captains) {
    for (const serviceId of captain.serviceIds) {
      specialtyIds.add(serviceId);
    }
  }

  return PILOT_SERVICE_OPTIONS.filter((option) => specialtyIds.has(option.id)).map(
    (option) => ({ id: option.id, label: option.label }),
  );
}

export function regionOptionsFromCaptains(captains: readonly CaptainClubPilot[]): string[] {
  return Array.from(
    new Set(captains.map((captain) => captain.regionGroup).filter((r) => r !== "Other")),
  ).sort();
}
