/** Homepage copy — Figma frame Homepage (808:8249). */

export const HOME_TRUST_ITEMS = [
  {
    title: "100% Background Checked",
    subtitle: "Verified Pilot Screening",
  },
  {
    title: "FAA Part 107 Status",
    subtitle: "Active Regulatory Compliance",
  },
  {
    title: "Secure Payments",
    subtitle: "Enterprise Escrow Protocol",
  },
] as const;

export const HOME_HERO = {
  client: {
    eyebrow: "FOR BUSINESSES",
    title: "Find Local Drone Pilots Anywhere",
    description:
      "Book qualified drone operators for events, inspections, mapping, real estate, construction, agriculture, public safety, and more.",
    ctaLabel: "Find a drone pilot",
    ctaHref: "/for-clients",
  },
  pilot: {
    eyebrow: "FOR PILOTS",
    title: "Get Paid Flying Missions",
    description:
      "Join a global network of drone professionals and submit proposals for amazing opportunities from businesses in your area and across the globe.",
    ctaLabel: "Join the Pilot Network",
    ctaHref: "/register?role=pilot",
  },
} as const;

export const HOME_AUDIENCE_CARDS = [
  {
    side: "client" as const,
    label: "Client Demands",
    title: "SCALE YOUR OPERATIONS",
    bullets: [
      "Post “Missions” like events, surveys, tourism, etc.",
      "Global capabilities with travel-willing remote pilots",
      "Direct message pilots compatible with your needs",
    ],
    linkHref: "/for-clients",
    linkLabel: "Learn more about client solutions →",
  },
  {
    side: "pilot" as const,
    label: "Pilot Careers",
    title: "ADVANCE THROUGH GRADES",
    bullets: [
      "Submit proposals to a variety of client-posted missions",
      "Automatic promotions allowing you to propose sooner",
      "Low commissions on contracts that get lower over time",
    ],
    linkHref: "/for-pilots",
    linkLabel: "View Pilot Requirements →",
  },
] as const;

export const HOME_SOP_STEPS = [
  {
    number: "01",
    title: "REQUEST",
    description:
      "Post your private or corporate need(s) and budget in our mission center which allows pilots to send proposals",
  },
  {
    number: "02",
    title: "ASSESS",
    description:
      "Upon receipt of proposals, review each pilot’s brief and total costs, or message them for more information",
  },
  {
    number: "03",
    title: "EXECUTE",
    description:
      "Hire the pilot, agree on details such as timeline and location, and the pilot will complete the task as agreed",
  },
  {
    number: "04",
    title: "REVIEW",
    description:
      "Once complete, both parties will assess the results and finalize the project, followed by a mutual review",
  },
] as const;

/** Grade benefits CTA — pricing page documents A-1…A-6 tiers and Fast Forward. */
export const HOME_GRADE_BENEFITS_HREF = "/pricing" as const;

export const HOME_PILOT_RANKS = [
  {
    code: "A-1",
    name: "Student",
    displayTitle: "STUDENT",
    subtitle: "INITIAL GRADE",
    badge: "a1",
    elite: false,
    progressLabel: "A2 - A1",
    progressPercent: 21,
  },
  {
    code: "A-2",
    name: "Jr. Flight Officer",
    displayTitle: "JR FLIGHT OFFICER",
    subtitle: "6 MONTH MEMBER",
    badge: "a2",
    elite: false,
    progressLabel: "A3 - A2",
    progressPercent: 51,
  },
  {
    code: "A-3",
    name: "Flight Officer",
    displayTitle: "FLIGHT OFFICER",
    subtitle: "1 YEAR MEMBER",
    badge: "a3",
    elite: false,
    progressLabel: "A4 - A3",
    progressPercent: 63,
  },
  {
    code: "A-4",
    name: "Sr. Flight Officer",
    displayTitle: "SR FLIGHT OFFICER",
    subtitle: "18 MONTHS MEMBER",
    badge: "a4",
    elite: false,
    progressLabel: "A5 - A4",
    progressPercent: 74,
  },
  {
    code: "A-5",
    name: "First Officer",
    displayTitle: "FIRST OFFICER",
    subtitle: "2 YEARS MEMBER",
    badge: "a5",
    elite: false,
    progressLabel: "A6 - A5",
    progressPercent: 92,
  },
  {
    code: "A-6",
    name: "Captain",
    displayTitle: "CAPTAIN",
    subtitle: "3 YEARS MEMBER",
    badge: "a6",
    elite: true,
    progressLabel: "A6",
    progressPercent: 100,
  },
] as const;

export type HomePilotRank = (typeof HOME_PILOT_RANKS)[number];

export const HOME_CAPABILITIES = [
  {
    title: "UNITED STATES OF AMERICA",
    description:
      "FAA Part 107 Compliance allows us to operate in every major city and/or rural area in every square mile of the United States of America",
  },
  {
    title: "EUROPE",
    description:
      "EASA Regulation Authority provides guidance and specific rules regarding drone flights throughout Europe, of which our pilots are aligned",
  },
] as const;
