import { getWingAutoRuleLabel } from "@/lib/wings/status";
import type {
  AdminBadgeCardDto,
  BadgeIconType,
  BadgeRarity,
} from "@/types/admin-badges";
import { BADGE_RARITIES } from "@/types/admin-badges";
import type { WingDefinitionDto } from "@/types/wing";

/** Seed / legacy fallback when `WingDefinition.rarity` is missing or invalid. */
const RARITY_BY_CODE: Record<string, BadgeRarity> = {
  "recreational-aviator-gold": "UNCOMMON",
  "remote-aviation-crew-silver": "COMMON",
  "aviator-wings-basic-gold": "EPIC",
  "aviator-wings-basic-silver": "RARE",
  "aviator-wings-senior": "LEGENDARY",
  "aviator-wings-master": "MYTHIC",
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
  "recreational-aviator-gold": "star-outline",
  "remote-aviation-crew-silver": "medal",
  "aviator-wings-basic-gold": "award",
  "aviator-wings-basic-silver": "star",
  "aviator-wings-senior": "trophy",
  "aviator-wings-master": "trophy",
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

export function isBadgeRarity(value: string | null | undefined): value is BadgeRarity {
  return Boolean(value && (BADGE_RARITIES as readonly string[]).includes(value));
}

export function defaultRarityForCode(code: string): BadgeRarity {
  return RARITY_BY_CODE[code] ?? "COMMON";
}

/**
 * Prefer persisted rarity. Fall back to code map / heuristics for legacy rows.
 */
export function deriveRarity(definition: WingDefinitionDto): BadgeRarity {
  if (isBadgeRarity(definition.rarity)) {
    return definition.rarity;
  }

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
  if (
    label === "trophy" ||
    label === "star" ||
    label === "lightning" ||
    label === "medal" ||
    label === "star-outline" ||
    label === "award"
  ) {
    return label;
  }
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
      return "Trophy";
    case "star":
      return "Star";
    case "lightning":
      return "Lightning";
    case "medal":
      return "Medal";
    case "star-outline":
      return "Outline star";
    case "award":
      return "Award";
  }
}

/** Persisted on WingDefinition.iconLabel — type key, not emoji. */
export function iconLabelForType(iconType: BadgeIconType): string {
  return iconType;
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
