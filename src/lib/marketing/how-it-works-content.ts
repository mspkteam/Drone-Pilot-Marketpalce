/** How It Works page copy — Figma frame 323:7693 */

import { CLIENT_HOW_IT_WORKS_STEPS } from "@/lib/marketing/for-clients-content";
import { PILOT_ONBOARDING_STEPS } from "@/lib/marketing/for-pilots-content";

export const HOW_IT_WORKS_CLIENT_STEPS = CLIENT_HOW_IT_WORKS_STEPS;

export const HOW_IT_WORKS_PILOT_STEPS = PILOT_ONBOARDING_STEPS;

export type HowItWorksTab = "clients" | "pilots";

export const HOW_IT_WORKS_TABS: { id: HowItWorksTab; label: string }[] = [
  { id: "clients", label: "For Clients" },
  { id: "pilots", label: "For Pilots" },
];
