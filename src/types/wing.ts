import type { BadgeRarity } from "@/types/admin-badges";

export const WING_CATEGORIES = ["milestone", "trust", "community"] as const;

export type WingCategory = (typeof WING_CATEGORIES)[number];

export const WING_AUTO_RULES = [
  "manual_only",
  "profile_approved",
  "active_membership",
  "membership_tier_min",
  "first_completed_booking",
  "completed_bookings_count",
  "job_applications_count",
  "five_star_reviews_count",
  "average_rating_min",
  "approved_verification",
  "approved_verifications_count",
  "has_certificate",
  "certificates_count",
  "has_certificate_template",
] as const;

export type WingAutoRule = (typeof WING_AUTO_RULES)[number];

export const WING_SOURCES = ["auto", "manual"] as const;

export type WingSource = (typeof WING_SOURCES)[number];

export type WingDefinitionDto = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: WingCategory;
  rarity: BadgeRarity;
  iconLabel: string | null;
  imageUrl: string | null;
  autoRule: WingAutoRule | null;
  ruleParam: string | null;
  threshold: number | null;
  isActive: boolean;
  sortOrder: number;
  awardedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PilotWingDto = {
  id: string;
  pilotProfileId: string;
  wingDefinitionId: string;
  code: string;
  title: string;
  description: string;
  category: WingCategory;
  iconLabel: string | null;
  source: WingSource;
  earnedAt: string;
};

export type AdminPilotWingDto = PilotWingDto & {
  pilot: {
    id: string;
    displayName: string;
    email: string;
  };
};

export type PublicPilotWingDto = {
  code: string;
  title: string;
  description: string;
  category: WingCategory;
  iconLabel: string | null;
  earnedAt: string;
};
