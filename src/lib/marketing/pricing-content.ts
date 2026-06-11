/** Pricing page copy — Figma frame 323:5052 */

export type PricingPlanFeature = {
  label: string;
  included: boolean;
};

export type PricingPlan = {
  code: string;
  rankKey: "a1" | "a2" | "a3" | "a4" | "a5" | "a6";
  title: string;
  priceMonthly: number;
  features: PricingPlanFeature[];
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    code: "A-1",
    rankKey: "a1",
    title: "Student",
    priceMonthly: 0,
    features: [
      { label: "Job visibility: 72h delay", included: true },
      { label: "Proposals: 3 / mo", included: true },
      { label: "Verified badge", included: false },
      { label: "Featured profile placement", included: false },
      { label: "Command-tier insignia", included: false },
    ],
  },
  {
    code: "A-2",
    rankKey: "a2",
    title: "Jr. Flight Officer",
    priceMonthly: 19,
    features: [
      { label: "Job visibility: 48h delay", included: true },
      { label: "Proposals: 10 / mo", included: true },
      { label: "Verified badge", included: true },
      { label: "Featured profile placement", included: false },
      { label: "Command-tier insignia", included: false },
    ],
  },
  {
    code: "A-3",
    rankKey: "a3",
    title: "Flight Officer",
    priceMonthly: 49,
    features: [
      { label: "Job visibility: 12h delay", included: true },
      { label: "Proposals: 30 / mo", included: true },
      { label: "Verified badge", included: true },
      { label: "Featured profile placement", included: true },
      { label: "Command-tier insignia", included: false },
    ],
  },
  {
    code: "A-4",
    rankKey: "a4",
    title: "Sr. Flight Officer",
    priceMonthly: 99,
    features: [
      { label: "Job visibility: Instant", included: true },
      { label: "Proposals: Unlimited", included: true },
      { label: "Verified badge", included: true },
      { label: "Featured profile placement", included: true },
      { label: "Command-tier insignia", included: true },
    ],
  },
  {
    code: "A-5",
    rankKey: "a5",
    title: "First Officer",
    priceMonthly: 199,
    features: [
      { label: "Job visibility: Instant + Priority", included: true },
      { label: "Proposals: Unlimited", included: true },
      { label: "Verified badge", included: true },
      { label: "Featured profile placement", included: true },
      { label: "Command-tier insignia", included: true },
    ],
  },
  {
    code: "A-6",
    rankKey: "a6",
    title: "Captain",
    priceMonthly: 399,
    features: [
      { label: "Job visibility: Instant + Featured", included: true },
      { label: "Proposals: Unlimited", included: true },
      { label: "Verified badge", included: true },
      { label: "Featured profile placement", included: true },
      { label: "Command-tier insignia", included: true },
    ],
  },
];

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
    feature: "Profile Visibility",
    values: ["Basic", "Improved", "Enhanced", "Priority", "Premium", "Highest"],
  },
  {
    feature: "Project Access",
    values: ["Limited", "Standard", "More", "Greater", "Wide", "Full"],
  },
  {
    feature: "Application Limits",
    values: ["5/mo", "15/mo", "40/mo", "Unlimited", "Unlimited", "Unlimited"],
  },
  {
    feature: "Badges / Wings",
    values: ["Entry", "Progress", "Pro", "Advanced", "Elite", "Leader"],
  },
  {
    feature: "Portfolio Space",
    values: ["3", "8", "15", "30", "60", "Unlimited"],
  },
  {
    feature: "Featured Placement",
    values: ["—", "—", "Optional", "Yes", "Priority", "Top"],
  },
  {
    feature: "Support Level",
    values: [
      "Standard",
      "Standard",
      "Pro",
      "Pro",
      "Priority",
      "Dedicated",
    ],
  },
] as const;

export const PRICING_FAQ_ITEMS = [
  {
    number: "01",
    question: "Can I upgrade later?",
    answer:
      "Yes — upgrade or downgrade any time as your business grows.",
  },
  {
    number: "02",
    question: "Do I need approval first?",
    answer:
      "Yes. Pilots must complete application and admin review before choosing a membership tier and accessing marketplace jobs.",
  },
  {
    number: "03",
    question: "When can I access jobs?",
    answer:
      "After approval and membership enrollment, job visibility follows your tier delay — from 72 hours on A-1 to instant access on A-4 and above.",
  },
  {
    number: "04",
    question: "Is there a commission?",
    answer:
      "Clients pay per mission with no subscription. A platform commission applies on completed bookings; pilot membership is separate from client fees.",
  },
  {
    number: "05",
    question: "How are pilots ranked?",
    answer:
      "Ranks A-1 through A-6 reflect experience, flight hours, performance, and verified history — with badges, wings, and tier upgrades earned over time.",
  },
] as const;
