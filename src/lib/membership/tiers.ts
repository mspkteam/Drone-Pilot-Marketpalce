import { PRICING_PLANS } from "@/lib/marketing/pricing-content";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/membership/pricing-tier-codes";

function priceYearlyForTier(tierCode: string): number {
  const pricingCode = TIER_CODE_TO_PRICING_PLAN_CODE[tierCode];
  const plan = PRICING_PLANS.find((entry) => entry.code === pricingCode);
  return (plan?.priceMonthly ?? 0) * 12;
}

/** Canonical A-1 … A-6 pilot membership tier definitions (seed + tests). */
export const MEMBERSHIP_TIER_DEFINITIONS = [
  {
    code: "A1_STUDENT",
    slug: "a1-student",
    name: "A-1 Student",
    priceYearly: priceYearlyForTier("A1_STUDENT"),
    jobVisibilityDelayHours: 48,
    canViewJobs: true,
    canApply: false,
    instructorEligible: false,
    sortOrder: 1,
    features: [
      "View approved jobs 48 hours after posting",
      "View-only — upgrade to A-2+ to submit bids",
      "Training-tier marketplace access",
    ],
  },
  {
    code: "A2_JUNIOR_FLIGHT_OFFICER",
    slug: "a2-junior-flight-officer",
    name: "A-2 Junior Flight Officer",
    priceYearly: priceYearlyForTier("A2_JUNIOR_FLIGHT_OFFICER"),
    jobVisibilityDelayHours: 36,
    canViewJobs: true,
    canApply: true,
    instructorEligible: false,
    sortOrder: 2,
    features: [
      "View jobs 36 hours after approval",
      "Submit bids and applications",
      "Standard marketplace access",
    ],
  },
  {
    code: "A3_FLIGHT_OFFICER",
    slug: "a3-flight-officer",
    name: "A-3 Flight Officer",
    priceYearly: priceYearlyForTier("A3_FLIGHT_OFFICER"),
    jobVisibilityDelayHours: 24,
    canViewJobs: true,
    canApply: true,
    instructorEligible: false,
    sortOrder: 3,
    features: [
      "View jobs 24 hours after approval",
      "Submit bids and applications",
    ],
  },
  {
    code: "A4_SENIOR_FLIGHT_OFFICER",
    slug: "a4-senior-flight-officer",
    name: "A-4 Senior Flight Officer",
    priceYearly: 189.98,
    jobVisibilityDelayHours: 12,
    canViewJobs: true,
    canApply: true,
    instructorEligible: true,
    sortOrder: 4,
    features: [
      "View jobs 12 hours after approval",
      "Submit bids and applications",
      "Instructor-eligible tier",
    ],
  },
  {
    code: "A5_FIRST_OFFICER",
    slug: "a5-first-officer",
    name: "A-5 First Officer",
    priceYearly: priceYearlyForTier("A5_FIRST_OFFICER"),
    jobVisibilityDelayHours: 6,
    canViewJobs: true,
    canApply: true,
    instructorEligible: true,
    sortOrder: 5,
    features: [
      "View jobs 6 hours after approval",
      "Submit bids and applications",
      "Instructor-eligible tier",
    ],
  },
  {
    code: "A6_CAPTAIN",
    slug: "a6-captain",
    name: "A-6 Captain",
    priceYearly: priceYearlyForTier("A6_CAPTAIN"),
    jobVisibilityDelayHours: 0,
    canViewJobs: true,
    canApply: true,
    instructorEligible: true,
    sortOrder: 6,
    features: [
      "Immediate job visibility on approval",
      "Submit bids and applications",
      "Instructor-eligible tier",
      "Highest marketplace priority tier",
    ],
  },
] as const;

export type MembershipTierCode =
  (typeof MEMBERSHIP_TIER_DEFINITIONS)[number]["code"];
