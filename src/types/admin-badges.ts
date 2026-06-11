import type { AdminPilotWingDto, WingAutoRule, WingCategory, WingDefinitionDto } from "@/types/wing";

export type BadgeRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type BadgeIconType =
  | "trophy"
  | "star"
  | "lightning"
  | "medal"
  | "star-outline"
  | "award";

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
  autoRule: WingAutoRule;
  threshold: number | null;
  ruleParam: string;
  isActive: boolean;
  sortOrder: number;
};
