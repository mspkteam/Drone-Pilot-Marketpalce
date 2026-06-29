/** Pilot portfolio items stored as JSON on PilotProfile.portfolioJson (M109). */

export type PilotPortfolioMediaType = "VIDEO" | "PHOTOSET";

export type PilotPortfolioItem = {
  id: string;
  type: PilotPortfolioMediaType;
  title: string;
  tags: string[];
  thumbnailUrl: string | null;
  description?: string;
  createdAt: string;
};

export const PILOT_PORTFOLIO_ROUTES = {
  profile: "/dashboard/pilot/profile",
  portfolio: "/dashboard/pilot/portfolio",
} as const;

export const PILOT_PORTFOLIO_TARGET_COUNT = 8;

export function parsePortfolioTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

export function parsePortfolioJson(raw: string | null | undefined): PilotPortfolioItem[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPortfolioItem);
  } catch {
    return [];
  }
}

function isPortfolioItem(value: unknown): value is PilotPortfolioItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PilotPortfolioItem>;
  return (
    typeof item.id === "string" &&
    (item.type === "VIDEO" || item.type === "PHOTOSET") &&
    typeof item.title === "string" &&
    Array.isArray(item.tags) &&
    (item.thumbnailUrl === null || typeof item.thumbnailUrl === "string") &&
    typeof item.createdAt === "string"
  );
}

export function serializePortfolioJson(items: PilotPortfolioItem[]): string {
  return JSON.stringify(items);
}

export type PilotPortfolioDraft = {
  type: PilotPortfolioMediaType;
  title: string;
  tags: string[];
  thumbnailUrl: string | null;
  description?: string;
};

export function createPortfolioItem(draft: PilotPortfolioDraft): PilotPortfolioItem {
  return {
    id: `pf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: draft.type,
    title: draft.title.trim(),
    tags: draft.tags.length > 0 ? draft.tags : ["PORTFOLIO"],
    thumbnailUrl: draft.thumbnailUrl,
    description: draft.description?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
}

export function portfolioStrengthStatus(
  count: number,
  target = PILOT_PORTFOLIO_TARGET_COUNT,
): "done" | "partial" | "missing" {
  if (count >= target) return "done";
  if (count > 0) return "partial";
  return "missing";
}

export function portfolioStrengthLabel(
  count: number,
  target = PILOT_PORTFOLIO_TARGET_COUNT,
): string {
  return `Portfolio (${count}/${target})`;
}
