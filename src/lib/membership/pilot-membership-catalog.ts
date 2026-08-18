import {
  RECOMMENDED_PRICING_PLAN_CODE,
  TIER_CODE_TO_PRICING_PLAN_CODE,
} from "@/lib/membership/pricing-tier-codes";

/** Annual base membership — required for all pilots (Figma 808:2478 / 1160:4705). */
export const PILOT_ANNUAL_MEMBERSHIP_FEE_USD = 99.99;

/** Remote Pilot Instructor annual add-on — A-4+ only (business rules / Figma). */
export const PILOT_INSTRUCTOR_ADDON_FEE_USD = 199.99;

/** Minimum Fast Forward tier code for instructor eligibility. */
export const PILOT_INSTRUCTOR_MIN_TIER_CODE = "A4_SENIOR_FLIGHT_OFFICER" as const;

export type PilotFastForwardTierCode =
  | "A1_STUDENT"
  | "A2_JUNIOR_FLIGHT_OFFICER"
  | "A3_FLIGHT_OFFICER"
  | "A4_SENIOR_FLIGHT_OFFICER"
  | "A5_FIRST_OFFICER"
  | "A6_CAPTAIN";

export type PilotFastForwardTier = {
  tierCode: PilotFastForwardTierCode;
  pricingCode: string;
  rankKey: "a1" | "a2" | "a3" | "a4" | "a5" | "a6";
  shortTitle: string;
  fastForwardFeeUsd: number;
  features: string[];
  isRecommended: boolean;
  isStartingGrade: boolean;
};

const FAST_FORWARD_TIERS: PilotFastForwardTier[] = [
  {
    tierCode: "A1_STUDENT",
    pricingCode: "A-1",
    rankKey: "a1",
    shortTitle: "Student",
    fastForwardFeeUsd: 0,
    isRecommended: false,
    isStartingGrade: true,
    features: [
      "View job posts after 48 hours",
      "3 proposals / month",
    ],
  },
  {
    tierCode: "A2_JUNIOR_FLIGHT_OFFICER",
    pricingCode: "A-2",
    rankKey: "a2",
    shortTitle: "Junior Flight Officer",
    fastForwardFeeUsd: 49.99,
    isRecommended: false,
    isStartingGrade: false,
    features: [
      "View job posts after 36 hours",
      "10 proposals / month",
    ],
  },
  {
    tierCode: "A3_FLIGHT_OFFICER",
    pricingCode: "A-3",
    rankKey: "a3",
    shortTitle: "Flight Officer",
    fastForwardFeeUsd: 69.99,
    isRecommended: false,
    isStartingGrade: false,
    features: [
      "View job posts after 24 hours",
      "30 proposals / month",
      "Visible in client search results",
    ],
  },
  {
    tierCode: "A4_SENIOR_FLIGHT_OFFICER",
    pricingCode: "A-4",
    rankKey: "a4",
    shortTitle: "Senior Flight Officer",
    fastForwardFeeUsd: 89.99,
    isRecommended: true,
    isStartingGrade: false,
    features: [
      "View jobs after 12 hours",
      "Proposals: Unlimited",
    ],
  },
  {
    tierCode: "A5_FIRST_OFFICER",
    pricingCode: "A-5",
    rankKey: "a5",
    shortTitle: "First Officer",
    fastForwardFeeUsd: 109.99,
    isRecommended: false,
    isStartingGrade: false,
    features: [
      "View jobs after 6 hours",
      "Proposals: Unlimited",
    ],
  },
  {
    tierCode: "A6_CAPTAIN",
    pricingCode: "A-6",
    rankKey: "a6",
    shortTitle: "Captain",
    fastForwardFeeUsd: 129.99,
    isRecommended: false,
    isStartingGrade: false,
    features: [
      "View jobs immediately",
      "Proposals: Unlimited",
    ],
  },
];

export const PILOT_ANNUAL_MEMBERSHIP_BENEFITS = [
  "Access to all job posts",
  "Create proposals",
  "Verified pilot badge",
  "Profile & portfolio",
  "Grade progression",
  "ID card after 30 approved membership days",
  "Uniform items available separately",
  "Membership benefits",
] as const;

export const PILOT_INSTRUCTOR_ADDON_BENEFITS = [
  "Appear publicly as a Remote Pilot Instructor",
  "Invite students with a discount code",
  "Students receive 20% off basic membership only",
  "15% off eligible bulk uniform items",
  "Instructor profile badge and listing visibility",
  "Support student progression through Remote Air Service",
] as const;

export const PILOT_INSTRUCTOR_DASHBOARD_BENEFITS = [
  "Appear publicly as Remote Pilot Instructor.",
  "Invite students with discount code.",
  "Students receive 20% off basic membership only.",
  "Discounted student epaulettes and wings.",
  "Support student progression and promotion.",
] as const;

export function listPilotFastForwardTiers(): PilotFastForwardTier[] {
  return FAST_FORWARD_TIERS;
}

export function getFastForwardTier(
  tierCode: string,
): PilotFastForwardTier | undefined {
  return FAST_FORWARD_TIERS.find((tier) => tier.tierCode === tierCode);
}

export function getFastForwardFeeUsd(tierCode: string): number {
  return getFastForwardTier(tierCode)?.fastForwardFeeUsd ?? 0;
}

export function getPricingCodeForTierCode(tierCode: string): string | null {
  return TIER_CODE_TO_PRICING_PLAN_CODE[tierCode] ?? null;
}

export function totalAtSignupUsd(fastForwardFeeUsd: number): number {
  return roundUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD + fastForwardFeeUsd);
}

export function getUpgradeDifferenceUsd(
  currentTierCode: string,
  targetTierCode: string,
): number {
  const currentFee = getFastForwardFeeUsd(currentTierCode);
  const targetFee = getFastForwardFeeUsd(targetTierCode);
  return roundUsd(Math.max(0, targetFee - currentFee));
}

export function isRecommendedFastForwardTier(pricingCode: string): boolean {
  return pricingCode === RECOMMENDED_PRICING_PLAN_CODE;
}

export function isInstructorEligibleTierCode(tierCode: string | null | undefined): boolean {
  if (!tierCode) return false;
  if (
    tierCode.startsWith("A7_") ||
    tierCode.startsWith("A8_") ||
    tierCode.startsWith("A9_") ||
    tierCode.startsWith("A10_")
  ) {
    return true;
  }
  const tier = getFastForwardTier(tierCode);
  if (!tier) return false;
  const min = getFastForwardTier(PILOT_INSTRUCTOR_MIN_TIER_CODE);
  if (!min) return false;
  const order = FAST_FORWARD_TIERS.findIndex((entry) => entry.tierCode === tier.tierCode);
  const minOrder = FAST_FORWARD_TIERS.findIndex(
    (entry) => entry.tierCode === min.tierCode,
  );
  return order >= minOrder;
}

export function formatMembershipUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}
