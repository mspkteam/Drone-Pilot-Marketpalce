/** Mock / local portfolio items — replace with portfolio API + storage (M109). */

export type PilotPortfolioMediaType = "VIDEO" | "PHOTOSET";

export type PilotPortfolioItem = {
  id: string;
  type: PilotPortfolioMediaType;
  title: string;
  tags: string[];
  thumbnailUrl: string | null;
  description?: string;
};

export const PILOT_PORTFOLIO_MOCK: readonly PilotPortfolioItem[] = [
  {
    id: "pf-1",
    type: "VIDEO",
    title: "Alpine Tower Inspection",
    tags: ["THERMAL", "INSPECTION"],
    thumbnailUrl: null,
  },
  {
    id: "pf-2",
    type: "PHOTOSET",
    title: "Coastal Survey 4K",
    tags: ["THERMAL", "INSPECTION"],
    thumbnailUrl: null,
  },
  {
    id: "pf-3",
    type: "VIDEO",
    title: "Crop Multispectral Map",
    tags: ["THERMAL", "INSPECTION"],
    thumbnailUrl: null,
  },
  {
    id: "pf-4",
    type: "PHOTOSET",
    title: "Wind Farm Quarterly",
    tags: ["THERMAL", "INSPECTION"],
    thumbnailUrl: null,
  },
  {
    id: "pf-5",
    type: "VIDEO",
    title: "Real Estate Cinematic",
    tags: ["THERMAL", "INSPECTION"],
    thumbnailUrl: null,
  },
  {
    id: "pf-6",
    type: "PHOTOSET",
    title: "Bridge LiDAR Scan",
    tags: ["THERMAL", "INSPECTION"],
    thumbnailUrl: null,
  },
] as const;

export const PILOT_PORTFOLIO_ROUTES = {
  profile: "/dashboard/pilot/profile",
  portfolio: "/dashboard/pilot/portfolio",
} as const;

export function parsePortfolioTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}
