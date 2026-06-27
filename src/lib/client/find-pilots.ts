import { formatPilotDayRateLabel } from "@/lib/client/pilot-pricing";
import { PILOT_SERVICE_OPTIONS, type PilotServiceId } from "@/types/pilot";
import type { PublicPilotListItemDto } from "@/types/public-pilot";

export type FindPilotFilterChip = {
  id: PilotServiceId;
  label: string;
};

export const FIND_PILOT_FILTER_CHIPS: readonly FindPilotFilterChip[] = [
  { id: "aerial_video", label: "Aerial Photography" },
  { id: "surveying", label: "Survey" },
  { id: "inspection", label: "Inspection" },
  { id: "events", label: "Events" },
  { id: "real_estate", label: "Real Estate" },
] as const;

export type ClientFindPilot = {
  id: string;
  initials: string;
  name: string;
  location: string;
  rating: string;
  projects: string;
  hours: string;
  tags: readonly string[];
  priceLabel: string;
  serviceIds: readonly PilotServiceId[];
  verified: boolean;
  profileHref: string;
};

export const CLIENT_FIND_PILOTS_ROUTES = {
  pilotProfile: (pilotProfileId: string) => `/pilots/${pilotProfileId}` as const,
} as const;

const SERVICE_LABELS = Object.fromEntries(
  PILOT_SERVICE_OPTIONS.map((option) => [option.id, option.label]),
) as Record<PilotServiceId, string>;

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function mapPublicPilotToFindPilot(
  pilot: PublicPilotListItemDto,
  completedBookings = 0,
): ClientFindPilot {
  const location =
    [pilot.locationCity, pilot.locationRegion].filter(Boolean).join(", ") ||
    "Location not set";

  const tags = pilot.servicesOffered
    .slice(0, 3)
    .map((service) => SERVICE_LABELS[service] ?? service);

  return {
    id: pilot.id,
    initials: initialsFromName(pilot.displayName),
    name: pilot.displayName,
    location,
    rating: pilot.averageRating != null ? pilot.averageRating.toFixed(1) : "New",
    projects:
      completedBookings > 0
        ? `${completedBookings} project${completedBookings === 1 ? "" : "s"}`
        : pilot.reviewCount > 0
          ? `${pilot.reviewCount} review${pilot.reviewCount === 1 ? "" : "s"}`
          : "New pilot",
    hours:
      completedBookings >= 10
        ? "Experienced operator"
        : pilot.reviewCount >= 5
          ? "Highly rated"
          : "Verified operator",
    tags: tags.length > 0 ? tags : ["Drone services"],
    priceLabel: formatPilotDayRateLabel(pilot.hourlyRateMin, pilot.hourlyRateMax),
    serviceIds: pilot.servicesOffered,
    verified: true,
    profileHref: CLIENT_FIND_PILOTS_ROUTES.pilotProfile(pilot.id),
  };
}

export function filterFindPilots(
  pilots: readonly ClientFindPilot[],
  query: string,
  activeFilter: PilotServiceId | null,
): ClientFindPilot[] {
  const normalizedQuery = query.trim().toLowerCase();

  return pilots.filter((pilot) => {
    if (activeFilter && !pilot.serviceIds.includes(activeFilter)) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchable = [
      pilot.name,
      pilot.location,
      pilot.location.split(",")[0] ?? "",
      ...pilot.tags,
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}
