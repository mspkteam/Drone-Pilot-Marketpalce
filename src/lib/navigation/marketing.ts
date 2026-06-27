/** Primary marketing header nav — Figma global header. */
export const marketingNav = [
  { label: "Find Pilots", href: "/pilots", match: "/pilots" },
  { label: "For Clients", href: "/for-clients", match: "/for-clients" },
  { label: "For Pilots", href: "/for-pilots", match: "/for-pilots" },
  { label: "Pricing", href: "/pricing", match: "/pricing" },
  { label: "How It Works", href: "/how-it-works", match: "/how-it-works" },
] as const;

export function isMarketingNavActive(
  pathname: string,
  match: string,
): boolean {
  if (match === "/pilots") {
    return pathname === "/pilots" || pathname.startsWith("/pilots/");
  }
  return pathname === match || pathname.startsWith(`${match}/`);
}

export const marketingFooterNav = [
  {
    title: "Regions",
    items: [
      { label: "North America", href: "/pilots?region=North%20America" },
      { label: "Western Europe", href: "/pilots?region=Western%20Europe" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { label: "Safety Standards", href: "/safety" },
      { label: "Pilot Screening", href: "/safety#screening" },
    ],
  },
] as const;
