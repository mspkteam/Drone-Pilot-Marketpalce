/** Homepage copy and structure — aligned to Figma frame Homepage (97:2145). */

export const HOME_TRUST_ITEMS = [
  {
    title: "Verified Licensed Pilots",
    subtitle: "100% Background Checked",
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

export const HOME_AUDIENCE_CARDS = [
  {
    side: "client" as const,
    label: "Client Demands",
    title: "SCALE YOUR OPERATIONS",
    description:
      "Connect with local professional, licensed, background-checked drone pilots with a variety of equipment to complete your project.",
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
    title: "ASCEND THE RANKS",
    description:
      "Build your professional pilot reputation through our platform and earn consistent compensation for the talented effort you put into your flying.",
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

export const HOME_PILOT_RANKS = [
  {
    code: "A-1",
    name: "STUDENT",
    subtitle: "0–100 HOURS",
    badge: "a1",
    elite: false,
  },
  {
    code: "A-2",
    name: "JR. FLIGHT OFFICER",
    subtitle: "100+ HOURS",
    badge: "a2",
    elite: false,
  },
  {
    code: "A-3",
    name: "FLIGHT OFFICER",
    subtitle: "500+ HOURS",
    badge: "a3",
    elite: false,
  },
  {
    code: "A-4",
    name: "SR. FLIGHT OFFICER",
    subtitle: "1000+ HOURS",
    badge: "a4",
    elite: false,
  },
  {
    code: "A-5",
    name: "FIRST OFFICER",
    subtitle: "COMMAND GRADE",
    badge: "a5",
    elite: false,
  },
  {
    code: "A-6",
    name: "CAPTAIN",
    subtitle: "MASTER OPERATIONS",
    badge: "a6",
    elite: true,
  },
] as const;

export const HOME_CAPABILITIES = [
  {
    title: "United States of America",
    description:
      "FAA Part 107 Compliance allows us to operate in every major city and/or rural area in every square mile of the United States of America",
  },
  {
    title: "EUROPE",
    description:
      "EASA Regulation Authority provides guidance and specific rules regarding drone flights throughout Europe, of which our pilots are aligned",
  },
] as const;
