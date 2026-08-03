import { listPilotFastForwardTiers } from "@/lib/membership/pilot-membership-catalog";
import { VERIFICATION_TYPES } from "@/types/verification";
import type { WingAutoRule } from "@/types/wing";

/** Grade rank for “at least A-n” comparisons (A-1 = 1 … A-10 = 10). */
export const MEMBERSHIP_TIER_RANK: Record<string, number> = {
  A1_STUDENT: 1,
  A2_JUNIOR_FLIGHT_OFFICER: 2,
  A3_FLIGHT_OFFICER: 3,
  A4_SENIOR_FLIGHT_OFFICER: 4,
  A5_FIRST_OFFICER: 5,
  A6_CAPTAIN: 6,
  A7_SENIOR_CAPTAIN: 7,
  A8_MASTER_CAPTAIN: 8,
  A9_FLEET_CAPTAIN: 9,
  A10_COMMODORE: 10,
};

export type WingConditionField =
  | "none"
  | "threshold"
  | "verification_type"
  | "membership_tier"
  | "certificate_template_slug"
  | "average_rating_tenths";

export type WingConditionDefinition = {
  rule: WingAutoRule;
  label: string;
  description: string;
  /** What the admin must configure besides enabling auto-award. */
  field: WingConditionField;
  thresholdLabel?: string;
  thresholdHint?: string;
  defaultThreshold?: number;
  /** Show in create/edit picker (manual_only is handled by the auto-award toggle). */
  selectable: boolean;
};

/**
 * Full catalog of assign conditions available on the site today.
 * Keep in sync with `pilotMeetsAutoRule` in `wings.ts`.
 */
export const WING_CONDITION_CATALOG: WingConditionDefinition[] = [
  {
    rule: "manual_only",
    label: "Manual award only",
    description: "Admin assigns this badge/wing to a specific pilot. No automatic grant.",
    field: "none",
    selectable: false,
  },
  {
    rule: "profile_approved",
    label: "Pilot profile approved",
    description: "Pilot’s profile status is approved by admin.",
    field: "none",
    selectable: true,
  },
  {
    rule: "active_membership",
    label: "Active membership",
    description: "Pilot has an active or trialing membership subscription.",
    field: "none",
    selectable: true,
  },
  {
    rule: "membership_tier_min",
    label: "Membership grade at least…",
    description:
      "Pilot’s current active grade is this tier or higher (A-1 Student → A-6 Captain).",
    field: "membership_tier",
    selectable: true,
  },
  {
    rule: "first_completed_booking",
    label: "First completed mission",
    description: "Pilot has completed at least one booking/mission.",
    field: "none",
    selectable: true,
  },
  {
    rule: "completed_bookings_count",
    label: "Completed missions (count)",
    description: "Pilot has completed at least N bookings.",
    field: "threshold",
    thresholdLabel: "Minimum completed missions",
    thresholdHint: "Example: 5 = Reliable Pro style milestone",
    defaultThreshold: 5,
    selectable: true,
  },
  {
    rule: "job_applications_count",
    label: "Proposals / bids submitted (count)",
    description: "Pilot has submitted at least N job applications (bids).",
    field: "threshold",
    thresholdLabel: "Minimum proposals submitted",
    thresholdHint: "Counts all applications, any status",
    defaultThreshold: 1,
    selectable: true,
  },
  {
    rule: "five_star_reviews_count",
    label: "Five-star reviews received (count)",
    description: "Pilot has received at least N published 5★ reviews from clients.",
    field: "threshold",
    thresholdLabel: "Minimum 5★ reviews",
    defaultThreshold: 1,
    selectable: true,
  },
  {
    rule: "average_rating_min",
    label: "Average rating at least…",
    description:
      "Pilot’s average published review rating meets or exceeds the target (stored as tenths: 45 = 4.5★).",
    field: "average_rating_tenths",
    thresholdLabel: "Minimum average (tenths)",
    thresholdHint: "40 = 4.0★, 45 = 4.5★, 50 = 5.0★",
    defaultThreshold: 45,
    selectable: true,
  },
  {
    rule: "approved_verification",
    label: "Approved verification (type)",
    description: "Pilot has an approved verification of the selected type.",
    field: "verification_type",
    selectable: true,
  },
  {
    rule: "approved_verifications_count",
    label: "Approved verifications (count)",
    description: "Pilot has at least N approved verifications (any type).",
    field: "threshold",
    thresholdLabel: "Minimum approved verifications",
    defaultThreshold: 2,
    selectable: true,
  },
  {
    rule: "has_certificate",
    label: "Has any platform certificate",
    description: "Pilot has been issued at least one platform certificate.",
    field: "none",
    selectable: true,
  },
  {
    rule: "certificates_count",
    label: "Platform certificates (count)",
    description: "Pilot holds at least N platform certificates.",
    field: "threshold",
    thresholdLabel: "Minimum certificates",
    defaultThreshold: 2,
    selectable: true,
  },
  {
    rule: "has_certificate_template",
    label: "Specific certificate template",
    description:
      "Pilot holds a certificate issued from the given template slug (set when creating the certificate template).",
    field: "certificate_template_slug",
    thresholdLabel: "Minimum copies (usually 1)",
    defaultThreshold: 1,
    selectable: true,
  },
];

export function getWingConditionDefinition(
  rule: WingAutoRule | null | undefined,
): WingConditionDefinition | null {
  if (!rule) return null;
  return WING_CONDITION_CATALOG.find((c) => c.rule === rule) ?? null;
}

export function listSelectableWingConditions(): WingConditionDefinition[] {
  return WING_CONDITION_CATALOG.filter((c) => c.selectable);
}

export function listMembershipTierOptions(): Array<{
  value: string;
  label: string;
}> {
  return listPilotFastForwardTiers().map((tier) => ({
    value: tier.tierCode,
    label: `${tier.pricingCode} — ${tier.shortTitle}`,
  }));
}

export function listVerificationTypeOptions(): Array<{
  value: string;
  label: string;
}> {
  const labels: Record<(typeof VERIFICATION_TYPES)[number], string> = {
    license: "Drone license",
    insurance: "Insurance",
    identity: "Identity",
    other: "Other certification",
  };
  return VERIFICATION_TYPES.map((type) => ({
    value: type,
    label: labels[type],
  }));
}

export function membershipTierRank(tierCode: string | null | undefined): number {
  if (!tierCode) return 0;
  return MEMBERSHIP_TIER_RANK[tierCode] ?? 0;
}

export function formatAverageRatingTenths(tenths: number): string {
  return `${(tenths / 10).toFixed(1)}★`;
}
