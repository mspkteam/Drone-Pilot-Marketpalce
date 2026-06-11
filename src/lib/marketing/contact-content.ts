/** Contact page copy — Figma frame 323:7132 */

export const CONTACT_SUPPORT_CARDS = [
  {
    title: "Client Support",
    description: "Project inquiries and hiring questions.",
    icon: "client" as const,
  },
  {
    title: "Pilot Support",
    description: "Applications, memberships, and profiles.",
    icon: "pilot" as const,
  },
  {
    title: "General Questions",
    description: "Partnerships, regions, and platform info.",
    icon: "general" as const,
  },
] as const;

export const CONTACT_ROLE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "pilot", label: "Pilot" },
  { value: "general", label: "General" },
] as const;

export const CONTACT_QUICK_HELP_LINKS = [
  { label: "Hire a Drone Pilot", href: "/for-clients" },
  { label: "Join as Pilot", href: "/for-pilots" },
  { label: "View Pilot Plans", href: "/pricing" },
  { label: "Read FAQ", href: "/pricing#faq" },
  { label: "Safety & Verification", href: "/safety" },
] as const;
