/** How It Works page copy — Figma frame 808:46297 */

import { CLIENT_HOW_IT_WORKS_STEPS } from "@/lib/marketing/for-clients-content";

export const HOW_IT_WORKS_CLIENT_STEPS = CLIENT_HOW_IT_WORKS_STEPS;

export const HOW_IT_WORKS_PILOT_STEPS = [
  {
    number: "01",
    title: "Create Pilot Account",
    description: "Register your profile and provide basic pilot information.",
  },
  {
    number: "02",
    title: "Complete Verification",
    description:
      "Submit license, drone, insurance, and identity details for approval.",
  },
  {
    number: "03",
    title: "Choose Membership",
    description:
      "Activate your $99.99/year membership and choose a one-time Fast Forward grade upgrade if needed.",
  },
  {
    number: "04",
    title: "View Eligible Missions",
    description: "Access approved jobs based on your grade visibility window.",
  },
  {
    number: "05",
    title: "Submit Proposals",
    description:
      "Send detailed proposals and communicate once the client starts a conversation.",
  },
  {
    number: "06",
    title: "Complete Contracts",
    description:
      "Perform the work, deliver results, receive ratings, and earn payouts after approval.",
  },
] as const;

export type HowItWorksTab = "clients" | "pilots";

export const HOW_IT_WORKS_TABS: { id: HowItWorksTab; label: string }[] = [
  { id: "clients", label: "For Clients" },
  { id: "pilots", label: "For Pilots" },
];
