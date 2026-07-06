/** For Pilots page copy — Figma frame 808:42998 */

import { forClientsAssets } from "@/lib/marketing/for-clients-assets";

/** Same Figma icon set as For Clients — matched by grid position. */
const pilotWhyJoinIcons = [
  forClientsAssets.audience.realEstate,
  forClientsAssets.audience.construction,
  forClientsAssets.audience.events,
  forClientsAssets.audience.marketing,
  forClientsAssets.audience.surveying,
  forClientsAssets.audience.private,
] as const;

export const PILOT_WHY_JOIN_CARDS = [
  {
    title: "Access Project Leads",
    description: "See drone work in your region as it comes in.",
    icon: pilotWhyJoinIcons[0],
  },
  {
    title: "Build Reputation",
    description: "Earn badges, wings, and grade advancement.",
    icon: pilotWhyJoinIcons[1],
  },
  {
    title: "Showcase Experience",
    description: "Display flight hours and verified history.",
    icon: pilotWhyJoinIcons[2],
  },
  {
    title: "Regional Branches",
    description: "Be part of a local pilot community.",
    icon: pilotWhyJoinIcons[3],
  },
  {
    title: "Grow With Tiers",
    description: "Upgrade your subscription as you scale.",
    icon: pilotWhyJoinIcons[4],
  },
  {
    title: "Aviation-Style Profile",
    description: "Professional profile with awards displayed.",
    icon: pilotWhyJoinIcons[5],
  },
] as const;

export const PILOT_ONBOARDING_STEPS = [
  {
    number: "01",
    title: "Submit Application",
    description: "Create your basic profile and submit details.",
  },
  {
    number: "02",
    title: "Admin Review",
    description: "Your account is reviewed before full access.",
  },
  {
    number: "03",
    title: "Get Approved",
    description: "You receive a notification to log in.",
  },
  {
    number: "04",
    title: "Choose Membership",
    description: "Select your pilot subscription tier.",
  },
  {
    number: "05",
    title: "Access Projects",
    description: "View opportunities at your tier level.",
  },
] as const;

export const PILOT_PROFILE_MOCK = {
  initials: "JS",
  name: "John Smith",
  branch: "North America Wing",
  rank: "A-3 PROFESSIONAL",
  tags: ["Silver Wings", "Inspection Badge", "4.9 Rating", "240 Flight Hours"],
} as const;

export const PILOT_MEMBERSHIP_INTRO =
  "Remote Air Service member grades are awarded automatically with active membership, for grades between A-2 and A-6, provided the member is in good standing." as const;

export const PILOT_MEMBERSHIP_PREVIEW = [
  {
    code: "A-1",
    title: "Student",
    subtitle: "NEW MEMBER",
  },
  {
    code: "A-2",
    title: "Jr. Flight Officer",
    subtitle: "SIX MONTHS",
  },
  {
    code: "A-3",
    title: "Flight Officer",
    subtitle: "ONE YEAR",
  },
] as const;

export const PILOT_REPUTATION_COPY = {
  title: "Leadership and Command potential",
  body: "Accept invite-only appointed positions like flight, squardon, and group commander, as well as administration positions.",
} as const;
