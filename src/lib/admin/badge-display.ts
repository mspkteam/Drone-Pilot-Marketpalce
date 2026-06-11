import { getWingAutoRuleLabel } from "@/lib/wings/status";
import type {
  AdminBadgeCardDto,
  BadgeIconType,
  BadgeRarity,
} from "@/types/admin-badges";
import type { WingDefinitionDto } from "@/types/wing";

const RARITY_BY_CODE: Record<string, BadgeRarity> = {
  "golden-wings": "LEGENDARY",
  "night-operator": "RARE",
  "first-bid": "COMMON",
  "squadron-lead": "EPIC",
  "perfect-streak": "EPIC",
  "founding-aviator": "LEGENDARY",
  "community-champion": "EPIC",
  "certified-pilot": "LEGENDARY",
  "five-star-debut": "RARE",
  "veteran-pilot": "EPIC",
  "reliable-pro": "RARE",
  "first-flight": "COMMON",
  "platform-pilot": "COMMON",
  "verified-license": "RARE",
};

const ICON_BY_CODE: Record<string, BadgeIconType> = {
  "golden-wings": "trophy",
  "night-operator": "star",
  "first-bid": "lightning",
  "squadron-lead": "medal",
  "perfect-streak": "star-outline",
  "founding-aviator": "award",
  "community-champion": "medal",
  "certified-pilot": "award",
  "five-star-debut": "star",
  "veteran-pilot": "trophy",
  "reliable-pro": "medal",
  "first-flight": "lightning",
  "platform-pilot": "award",
  "verified-license": "star-outline",
};

export function deriveRarity(definition: WingDefinitionDto): BadgeRarity {
  const mapped = RARITY_BY_CODE[definition.code];
  if (mapped) return mapped;

  if (definition.threshold && definition.threshold >= 10) return "LEGENDARY";
  if (definition.category === "trust") return "RARE";
  if (definition.category === "community") return "EPIC";
  if (definition.threshold && definition.threshold >= 5) return "EPIC";
  if (definition.awardedCount > 0 && definition.awardedCount < 50) return "LEGENDARY";
  return "COMMON";
}

export function deriveIconType(definition: WingDefinitionDto): BadgeIconType {
  const mapped = ICON_BY_CODE[definition.code];
  if (mapped) return mapped;

  const label = definition.iconLabel ?? "";
  if (label.includes("★") || label.includes("☆")) return "star";
  if (label.includes("⚡")) return "lightning";
  if (label.includes("🏆")) return "trophy";
  if (label.includes("♛") || label.includes("🎖")) return "medal";
  if (definition.category === "trust") return "award";
  if (definition.category === "community") return "medal";
  return "star-outline";
}

export function iconGlyph(iconType: BadgeIconType): string {
  switch (iconType) {
    case "trophy":
      return "🏆";
    case "star":
      return "★";
    case "lightning":
      return "⚡";
    case "medal":
      return "🎖";
    case "star-outline":
      return "✦";
    case "award":
      return "🏅";
  }
}

export function iconLabelForType(iconType: BadgeIconType): string {
  return iconGlyph(iconType);
}

function buildCriteria(definition: WingDefinitionDto): string {
  if (definition.autoRule === "manual_only") {
    return definition.description;
  }
  const rule = getWingAutoRuleLabel(definition.autoRule);
  if (definition.threshold) {
    return `${rule} · ${definition.threshold}`;
  }
  if (definition.ruleParam) {
    return `${rule} · ${definition.ruleParam}`;
  }
  return definition.description || rule;
}

export function enrichBadgeDefinition(
  definition: WingDefinitionDto,
): AdminBadgeCardDto {
  return {
    ...definition,
    criteria: buildCriteria(definition),
    rarity: deriveRarity(definition),
    iconType: deriveIconType(definition),
    isMock: false,
  };
}

export const MOCK_BADGE_CARDS: AdminBadgeCardDto[] = [
  {
    id: "mock-golden-wings",
    code: "golden-wings",
    title: "Golden Wings",
    description: "1,000+ flight hours",
    category: "milestone",
    iconLabel: "🏆",
    autoRule: "manual_only",
    ruleParam: null,
    threshold: 1000,
    isActive: true,
    sortOrder: 1,
    awardedCount: 84,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    criteria: "1,000+ flight hours",
    rarity: "LEGENDARY",
    iconType: "trophy",
    isMock: true,
  },
  {
    id: "mock-night-operator",
    code: "night-operator",
    title: "Night Operator",
    description: "25 night missions",
    category: "milestone",
    iconLabel: "★",
    autoRule: "completed_bookings_count",
    ruleParam: null,
    threshold: 25,
    isActive: true,
    sortOrder: 2,
    awardedCount: 312,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    criteria: "25 night missions",
    rarity: "RARE",
    iconType: "star",
    isMock: true,
  },
  {
    id: "mock-first-bid",
    code: "first-bid",
    title: "First Bid",
    description: "Submitted first mission bid",
    category: "milestone",
    iconLabel: "⚡",
    autoRule: "first_completed_booking",
    ruleParam: null,
    threshold: 1,
    isActive: true,
    sortOrder: 3,
    awardedCount: 2840,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    criteria: "Submitted first mission bid",
    rarity: "COMMON",
    iconType: "lightning",
    isMock: true,
  },
  {
    id: "mock-squadron-lead",
    code: "squadron-lead",
    title: "Squadron Lead",
    description: "Mentored 10 pilots",
    category: "community",
    iconLabel: "🎖",
    autoRule: "manual_only",
    ruleParam: null,
    threshold: 10,
    isActive: true,
    sortOrder: 4,
    awardedCount: 48,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    criteria: "Mentored 10 pilots",
    rarity: "EPIC",
    iconType: "medal",
    isMock: true,
  },
  {
    id: "mock-perfect-streak",
    code: "perfect-streak",
    title: "Perfect Streak",
    description: "100% rating · 50 missions",
    category: "milestone",
    iconLabel: "✦",
    autoRule: "five_star_reviews_count",
    ruleParam: null,
    threshold: 50,
    isActive: true,
    sortOrder: 5,
    awardedCount: 122,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    criteria: "100% rating · 50 missions",
    rarity: "EPIC",
    iconType: "star-outline",
    isMock: true,
  },
  {
    id: "mock-founding-aviator",
    code: "founding-aviator",
    title: "Founding Aviator",
    description: "Joined in launch month",
    category: "community",
    iconLabel: "🏅",
    autoRule: "manual_only",
    ruleParam: null,
    threshold: null,
    isActive: true,
    sortOrder: 6,
    awardedCount: 36,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    criteria: "Joined in launch month",
    rarity: "LEGENDARY",
    iconType: "award",
    isMock: true,
  },
];
