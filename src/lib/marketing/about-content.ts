/** About page copy — Figma frame 323:8209 */

import { forClientsAssets } from "@/lib/marketing/for-clients-assets";

/** Same six icons as For Clients “Who It’s For” — grid order. */
const aboutDifferentiatorIcons = [
  forClientsAssets.audience.realEstate,
  forClientsAssets.audience.construction,
  forClientsAssets.audience.events,
  forClientsAssets.audience.marketing,
  forClientsAssets.audience.surveying,
  forClientsAssets.audience.private,
] as const;

export const ABOUT_DIFFERENTIATOR_CARDS = [
  {
    title: "Aviation-inspired design",
    description: "A premium, professional aesthetic.",
    icon: aboutDifferentiatorIcons[0],
  },
  {
    title: "Verified pilot onboarding",
    description: "Every pilot is reviewed.",
    icon: aboutDifferentiatorIcons[1],
  },
  {
    title: "Reputation & badges",
    description: "Recognize real flight experience.",
    icon: aboutDifferentiatorIcons[2],
  },
  {
    title: "Regional branch structure",
    description: "Local pilots, local jobs.",
    icon: aboutDifferentiatorIcons[3],
  },
  {
    title: "Client-focused hiring",
    description: "Compare and hire with clarity.",
    icon: aboutDifferentiatorIcons[4],
  },
  {
    title: "Pilot growth opportunities",
    description: "Scale your business over time.",
    icon: aboutDifferentiatorIcons[5],
  },
] as const;

export const ABOUT_AUDIENCE_CARDS = [
  {
    title: "Clients",
    description:
      "Businesses, agencies, property owners, event organizers, and project managers who need drone services.",
  },
  {
    title: "Pilots",
    description:
      "Drone professionals who want more visibility, structured opportunities, and reputation growth.",
  },
] as const;
