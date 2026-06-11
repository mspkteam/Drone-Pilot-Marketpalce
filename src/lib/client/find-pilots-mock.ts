/** Mock data for Client Find Pilots — replace with directory API in M58. */

export const FIND_PILOT_FILTER_CHIPS = [
  "Aerial Photography",
  "Survey",
  "Inspection",
  "Thermal",
  "Events",
] as const;

export type FindPilotFilterChip = (typeof FIND_PILOT_FILTER_CHIPS)[number];

export type ClientFindPilot = {
  id: string;
  slug: string;
  initials: string;
  name: string;
  location: string;
  rating: string;
  projects: string;
  hours: string;
  tags: readonly string[];
  priceLabel: string;
  categories: readonly FindPilotFilterChip[];
  verified: boolean;
};

const PILOT_JS: Omit<ClientFindPilot, "id"> = {
  slug: "john-smith",
  initials: "JS",
  name: "John Smith",
  location: "Dallas, TX",
  rating: "4.9",
  projects: "120 projects",
  hours: "2500+ hrs",
  tags: ["Aerial Photography", "Survey Mapping", "Inspection"],
  priceLabel: "from $850/day",
  categories: ["Aerial Photography", "Survey", "Inspection"],
  verified: true,
};

const PILOT_SC: Omit<ClientFindPilot, "id"> = {
  slug: "sarah-chen",
  initials: "SC",
  name: "Sarah Chen",
  location: "Austin, TX",
  rating: "5",
  projects: "87 projects",
  hours: "1800+ hrs",
  tags: ["Cinematic Video", "Events", "Real Estate"],
  priceLabel: "from $950/day",
  categories: ["Aerial Photography", "Events"],
  verified: true,
};

const PILOT_DO: Omit<ClientFindPilot, "id"> = {
  slug: "daniel-okafor",
  initials: "DO",
  name: "Daniel Okafor",
  location: "Houston, TX",
  rating: "4.8",
  projects: "64 projects",
  hours: "1400+ hrs",
  tags: ["Thermal", "Agriculture", "Inspection"],
  priceLabel: "from $700/day",
  categories: ["Thermal", "Inspection"],
  verified: true,
};

export const CLIENT_FIND_PILOTS: readonly ClientFindPilot[] = [
  { id: "find-pilot-1", ...PILOT_JS },
  { id: "find-pilot-2", ...PILOT_SC },
  { id: "find-pilot-3", ...PILOT_DO },
  { id: "find-pilot-4", ...PILOT_JS },
  { id: "find-pilot-5", ...PILOT_SC },
  { id: "find-pilot-6", ...PILOT_DO },
] as const;

export const CLIENT_FIND_PILOTS_ROUTES = {
  pilotProfile: (slug: string) => `/pilots/${slug}` as const,
} as const;

export function filterFindPilots(
  pilots: readonly ClientFindPilot[],
  query: string,
  activeFilter: FindPilotFilterChip | null,
): ClientFindPilot[] {
  const normalizedQuery = query.trim().toLowerCase();

  return pilots.filter((pilot) => {
    if (activeFilter && !pilot.categories.includes(activeFilter)) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchable = [
      pilot.name,
      pilot.location,
      pilot.location.split(",")[0] ?? "",
      ...pilot.tags,
      ...pilot.categories,
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}
