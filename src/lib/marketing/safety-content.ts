/** Safety page copy — Figma frame 323:5900 */

import { forClientsAssets } from "@/lib/marketing/for-clients-assets";

/** Same six icons as For Pilots “Built for Professional Drone Pilots” — grid order. */
const safetyVerifyIcons = [
  forClientsAssets.audience.realEstate,
  forClientsAssets.audience.construction,
  forClientsAssets.audience.events,
  forClientsAssets.audience.marketing,
  forClientsAssets.audience.surveying,
  forClientsAssets.audience.private,
] as const;

export const SAFETY_VERIFY_CARDS = [
  {
    title: "Profile Review",
    description: "Identity and pilot details checked.",
    icon: safetyVerifyIcons[0],
  },
  {
    title: "License / Certification",
    description: "Region-appropriate documents reviewed.",
    icon: safetyVerifyIcons[1],
  },
  {
    title: "Experience",
    description: "Years flown and project background.",
    icon: safetyVerifyIcons[2],
  },
  {
    title: "Service Category",
    description: "Confirm what each pilot is approved to deliver.",
    icon: safetyVerifyIcons[3],
  },
  {
    title: "Portfolio Review",
    description: "Sample work reviewed for quality.",
    icon: safetyVerifyIcons[4],
  },
  {
    title: "Admin Approval",
    description: "Final sign-off before going live.",
    icon: safetyVerifyIcons[5],
  },
] as const;
export const SAFETY_CONFIDENCE_CHECKLIST = [
  "View pilot profiles",
  "Check services and experience",
  "Review reputation badges",
  "Compare completed work",
  "Use a structured hiring process",
] as const;

export const SAFETY_WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Pilot submits details",
    description: "Application reviewed by admin.",
  },
  {
    number: "02",
    title: "Admin reviews account",
    description: "Verifications confirmed.",
  },
  {
    number: "03",
    title: "Client posts project",
    description: "Scope is documented up front.",
  },
  {
    number: "04",
    title: "Pilot confirms requirements",
    description: "Airspace and conditions checked.",
  },
  {
    number: "05",
    title: "Project completed safely",
    description: "Flight performed to spec.",
  },
  {
    number: "06",
    title: "Client reviews work",
    description: "Feedback builds reputation.",
  },
] as const;
