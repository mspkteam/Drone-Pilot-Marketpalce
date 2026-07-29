import type { AdminPilotWingDto, WingAutoRule, WingCategory, WingDefinitionDto } from "@/types/wing";

export type BadgeRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC";

export const BADGE_RARITIES: readonly BadgeRarity[] = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
] as const;

/** Ascending progression: Common (1) → Mythic (6). */
export const BADGE_RARITY_RANK: Record<BadgeRarity, number> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  MYTHIC: 6,
};

export type BadgeIconType =
  | "trophy"
  | "star"
  | "lightning"
  | "medal"
  | "star-outline"
  | "award";

export const BADGE_ICON_TYPES: readonly BadgeIconType[] = [
  "trophy",
  "star",
  "lightning",
  "medal",
  "star-outline",
  "award",
] as const;

export type AdminBadgeCardDto = WingDefinitionDto & {
  criteria: string;
  rarity: BadgeRarity;
  iconType: BadgeIconType;
  isMock?: boolean;
};

export type AdminBadgeStatsDto = {
  totalBadges: number;
  awarded30d: number;
  awarded30dSubtext: string;
  mostEarnedTitle: string;
  mostEarnedSubtext: string;
  rarestTitle: string;
  rarestSubtext: string;
  usingMockStats: boolean;
};

export type AdminBadgeEngineDataDto = {
  badges: AdminBadgeCardDto[];
  stats: AdminBadgeStatsDto;
  recentAwards: AdminPilotWingDto[];
  pilots: Array<{ id: string; displayName: string; email: string }>;
  usingMockBadges: boolean;
};

export type BadgeFormInput = {
  title: string;
  description: string;
  category: WingCategory;
  rarity: BadgeRarity;
  iconType: BadgeIconType;
  imageUrl: string;
  autoRule: WingAutoRule;
  threshold: number | null;
  ruleParam: string;
  isActive: boolean;
  sortOrder: number;
};
