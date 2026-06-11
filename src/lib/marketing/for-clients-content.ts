/** For Clients page copy — Figma frame 323:3765 */

import { forClientsAssets } from "@/lib/marketing/for-clients-assets";

export const CLIENT_AUDIENCE_CARDS = [
  {
    title: "Real Estate Agencies",
    description: "Cinematic property videos and listing photos.",
    icon: forClientsAssets.audience.realEstate,
  },
  {
    title: "Construction Companies",
    description: "Site monitoring, progress reports, and inspections.",
    icon: forClientsAssets.audience.construction,
  },
  {
    title: "Event Organizers",
    description: "Coverage for festivals, weddings, and sports.",
    icon: forClientsAssets.audience.events,
  },
  {
    title: "Marketing Teams",
    description: "Bold aerial content for brand campaigns.",
    icon: forClientsAssets.audience.marketing,
  },
  {
    title: "Surveying Companies",
    description: "Topography, orthomaps, and volumetrics.",
    icon: forClientsAssets.audience.surveying,
  },
  {
    title: "Private Clients",
    description: "Personal projects and one-off shoots.",
    icon: forClientsAssets.audience.private,
  },
] as const;

export const CLIENT_HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up so projects and messages stay organized.",
  },
  {
    number: "02",
    title: "Post Your Project",
    description: "Add location, type, date, budget, and flight details.",
  },
  {
    number: "03",
    title: "Receive Offers",
    description: "Verified pilots apply or submit quotes.",
  },
  {
    number: "04",
    title: "Compare & Hire",
    description: "Review profiles, ratings, and flight history.",
  },
  {
    number: "05",
    title: "Complete the Job",
    description: "Work with your pilot and finish safely.",
  },
] as const;

export const CLIENT_BENEFITS = [
  "Save time finding pilots",
  "Access verified professionals",
  "Compare offers in one place",
  "Manage projects easily",
  "Build trust through reviews",
  "Clear, structured workflow",
] as const;
