import {
  getFastForwardFeeUsd,
  totalAtSignupUsd,
} from "@/lib/membership/pilot-membership-catalog";

function priceYearlyForTier(tierCode: string): number {
  return totalAtSignupUsd(getFastForwardFeeUsd(tierCode));
}

/** Live A-1 … A-6 pilot membership tier definitions (seed + Fast Forward). */
export const LIVE_MEMBERSHIP_TIER_DEFINITIONS = [
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
    honorary: false as const,
    features: [
      "View approved jobs 48 hours after posting",
      "View-only — upgrade to A-2+ to submit bids",
      "Training-tier marketplace access",
    ],
  },
  {
    code: "A2_JUNIOR_FLIGHT_OFFICER",
    slug: "a2-junior-flight-officer",
    name: "A-2 Jr. Flight Officer",
    priceYearly: priceYearlyForTier("A2_JUNIOR_FLIGHT_OFFICER"),
    jobVisibilityDelayHours: 36,
    canViewJobs: true,
    canApply: true,
    instructorEligible: false,
    sortOrder: 2,
    honorary: false as const,
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
    honorary: false as const,
    features: [
      "View jobs 24 hours after approval",
      "Submit bids and applications",
    ],
  },
  {
    code: "A4_SENIOR_FLIGHT_OFFICER",
    slug: "a4-senior-flight-officer",
    name: "A-4 Sr. Flight Officer",
    priceYearly: priceYearlyForTier("A4_SENIOR_FLIGHT_OFFICER"),
    jobVisibilityDelayHours: 12,
    canViewJobs: true,
    canApply: true,
    instructorEligible: true,
    sortOrder: 4,
    honorary: false as const,
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
    honorary: false as const,
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
    honorary: false as const,
    features: [
      "Immediate job visibility on approval",
      "Submit bids and applications",
      "Instructor-eligible tier",
      "Highest marketplace priority tier",
    ],
  },
] as const;

/**
 * Invitation-only leadership grades (A-7 … A-10).
 * Same marketplace visibility as A-6; no fee; Super Admin assign only.
 */
export const HONORARY_MEMBERSHIP_TIER_DEFINITIONS = [
  {
    code: "A7_SENIOR_CAPTAIN",
    slug: "a7-senior-captain",
    name: "A-7 Senior Captain",
    priceYearly: 0,
    jobVisibilityDelayHours: 0,
    canViewJobs: true,
    canApply: true,
    instructorEligible: true,
    sortOrder: 7,
    honorary: true as const,
    features: [
      "Invitation-only honorary grade",
      "Same marketplace access as A-6 Captain",
      "Listed in Captain's Club",
    ],
  },
  {
    code: "A8_MASTER_CAPTAIN",
    slug: "a8-master-captain",
    name: "A-8 Master Captain",
    priceYearly: 0,
    jobVisibilityDelayHours: 0,
    canViewJobs: true,
    canApply: true,
    instructorEligible: true,
    sortOrder: 8,
    honorary: true as const,
    features: [
      "Invitation-only honorary grade",
      "Same marketplace access as A-6 Captain",
      "Listed in Captain's Club",
    ],
  },
  {
    code: "A9_FLEET_CAPTAIN",
    slug: "a9-fleet-captain",
    name: "A-9 Fleet Captain",
    priceYearly: 0,
    jobVisibilityDelayHours: 0,
    canViewJobs: true,
    canApply: true,
    instructorEligible: true,
    sortOrder: 9,
    honorary: true as const,
    features: [
      "Invitation-only honorary grade",
      "Same marketplace access as A-6 Captain",
      "Listed in Captain's Club",
    ],
  },
  {
    code: "A10_COMMODORE",
    slug: "a10-commodore",
    name: "A-10 Commodore",
    priceYearly: 0,
    jobVisibilityDelayHours: 0,
    canViewJobs: true,
    canApply: true,
    instructorEligible: true,
    sortOrder: 10,
    honorary: true as const,
    features: [
      "Invitation-only honorary grade",
      "Same marketplace access as A-6 Captain",
      "Listed in Captain's Club",
    ],
  },
] as const;

/** All membership tiers including honorary (seed + visibility). */
export const MEMBERSHIP_TIER_DEFINITIONS = [
  ...LIVE_MEMBERSHIP_TIER_DEFINITIONS,
  ...HONORARY_MEMBERSHIP_TIER_DEFINITIONS,
] as const;

export type MembershipTierCode =
  (typeof MEMBERSHIP_TIER_DEFINITIONS)[number]["code"];

export type LiveMembershipTierCode =
  (typeof LIVE_MEMBERSHIP_TIER_DEFINITIONS)[number]["code"];

export type HonoraryMembershipTierCode =
  (typeof HONORARY_MEMBERSHIP_TIER_DEFINITIONS)[number]["code"];

/** Captain's Club + marketplace-elite plan codes (A-6 and honorary). */
export const CAPTAINS_CLUB_TIER_CODES = [
  "A6_CAPTAIN",
  "A7_SENIOR_CAPTAIN",
  "A8_MASTER_CAPTAIN",
  "A9_FLEET_CAPTAIN",
  "A10_COMMODORE",
] as const;
