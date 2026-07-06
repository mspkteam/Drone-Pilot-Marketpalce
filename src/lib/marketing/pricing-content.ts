/** Pricing page copy — $99.99/yr membership + one-time Fast Forward grades */

import {
  formatMembershipUsd,
  listPilotFastForwardTiers,
  PILOT_ANNUAL_MEMBERSHIP_BENEFITS,
  PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
  totalAtSignupUsd,
} from "@/lib/membership/pilot-membership-catalog";

export type PricingPlanFeature = {
  label: string;
  included: boolean;
};

export type MarketingGradePlan = {
  code: string;
  rankKey: "a1" | "a2" | "a3" | "a4" | "a5" | "a6";
  title: string;
  fastForwardFeeUsd: number;
  isStartingGrade: boolean;
  isRecommended: boolean;
  features: PricingPlanFeature[];
};

/** @deprecated Use MARKETING_GRADE_PLANS — kept for admin plan-feature defaults */
export type PricingPlan = MarketingGradePlan & {
  priceMonthly: number;
};

export const MARKETING_MEMBERSHIP_INTRO = {
  eyebrow: "Annual membership",
  title: "One membership. Six grades.",
  body: `Every approved pilot enrolls in Remote Air Service membership at ${formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)}/year. Choose a starting grade with an optional one-time Fast Forward fee — upgrade later by paying the difference only.`,
  feeLabel: "Annual membership",
  feeAmount: formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD),
  feePeriod: "/year",
} as const;

export const MARKETING_GRADE_PLANS: MarketingGradePlan[] =
  listPilotFastForwardTiers().map((tier) => ({
    code: tier.pricingCode,
    rankKey: tier.rankKey,
    title: tier.shortTitle,
    fastForwardFeeUsd: tier.fastForwardFeeUsd,
    isStartingGrade: tier.isStartingGrade,
    isRecommended: tier.isRecommended,
    features: tier.features.map((label) => ({ label, included: true })),
  }));

/** Legacy export — maps Fast Forward fees for admin display helpers */
export const PRICING_PLANS: PricingPlan[] = MARKETING_GRADE_PLANS.map(
  (plan) => ({
    ...plan,
    priceMonthly: plan.fastForwardFeeUsd,
  }),
);

export { PILOT_ANNUAL_MEMBERSHIP_BENEFITS, totalAtSignupUsd };

export const PRICING_COMPARISON_COLUMNS = [
  "A-1",
  "A-2",
  "A-3",
  "A-4",
  "A-5",
  "A-6",
] as const;

export const PRICING_COMPARISON_ROWS = [
  {
    feature: "Job visibility delay",
    values: ["48h", "36h", "24h", "12h", "6h", "Instant"],
  },
  {
    feature: "Proposals / month",
    values: ["3", "10", "30", "Unlimited", "Unlimited", "Unlimited"],
  },
  {
    feature: "Client search visibility",
    values: ["—", "—", "Yes", "Yes", "Yes", "Yes"],
  },
  {
    feature: "One-time Fast Forward",
    values: [
      "$0",
      "$49.99",
      "$69.99",
      "$89.99",
      "$109.99",
      "$129.99",
    ],
  },
  {
    feature: "Annual membership",
    values: [
      "$99.99",
      "$99.99",
      "$99.99",
      "$99.99",
      "$99.99",
      "$99.99",
    ],
  },
  {
    feature: "Instructor eligible",
    values: ["—", "—", "—", "Yes", "Yes", "Yes"],
  },
  {
    feature: "Captain's Club eligible",
    values: ["—", "—", "—", "—", "—", "Yes"],
  },
] as const;

export const PRICING_FAQ_ITEMS = [
  {
    number: "01",
    question: "What does membership cost?",
    answer: `All pilots pay ${formatMembershipUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD)} per year for marketplace access. Fast Forward is a separate one-time fee when you choose a higher starting grade or upgrade later.`,
  },
  {
    number: "02",
    question: "Do I need approval first?",
    answer:
      "Yes. Pilots must complete application and admin review before enrolling in membership and accessing marketplace jobs.",
  },
  {
    number: "03",
    question: "When can I access jobs?",
    answer:
      "After approval and membership enrollment, job visibility follows your grade — from 48 hours on A-1 to immediate access on A-6.",
  },
  {
    number: "04",
    question: "How do upgrades work?",
    answer:
      "Upgrade any time by paying the Fast Forward difference between your current grade and the target grade. Your annual membership renews separately at $99.99/year.",
  },
  {
    number: "05",
    question: "Is there a commission?",
    answer:
      "Clients pay per mission with no subscription. A 15% platform commission applies on completed bookings; pilot membership is separate from client fees.",
  },
] as const;
