export const CAPTAINS_CLUB_HERO = {
  eyebrow: "HONORING EXCELLENCE IN EVERY FLIGHT",
  titleLead: "Captain's",
  titleAccent: "Club",
  description:
    "Captain's Club recognizes active Captains of Remote Air Service who are professional, reliable, background-checked, credential-verified, and committed to safe service.",
} as const;

export const CAPTAINS_CLUB_STANDARDS = {
  eyebrow: "WHAT MAKES A CAPTAIN?",
  title: "Standards that set us apart.",
  items: [
    {
      id: "elite-grade",
      title: "Elite Grade Status",
      description:
        "Only A-6 Captains with proven leadership and flight expertise are invited to the Captain's Club.",
    },
    {
      id: "verified-insured",
      title: "Verified & Insured",
      description:
        "Every Captain is credential-verified, background-checked, and fully insured.",
    },
    {
      id: "professionalism",
      title: "Professionalism",
      description:
        "Commitment to integrity, clear communication, and exceptional service.",
    },
    {
      id: "experience",
      title: "Extensive Experience",
      description:
        "Thousands of flight hours across aircraft, missions, and operating environments.",
    },
  ],
} as const;

export const CAPTAINS_CLUB_ROUTES = {
  hireCaptain: "/register?role=client",
  postProject: "/dashboard/client/jobs/new",
  directory: "/captains-club#captains-directory",
  browseAllPilots: "/pilots",
  pilotProfile: (pilotProfileId: string) => `/pilots/${pilotProfileId}` as const,
  support: "/contact",
} as const;
