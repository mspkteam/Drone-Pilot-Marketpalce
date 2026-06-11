/** Primary marketing header nav — Figma global header. */
export const marketingNav = [
  { label: "Hire Pilots", href: "/for-clients", match: "/for-clients" },
  { label: "Join as Pilot", href: "/for-pilots", match: "/for-pilots" },
  { label: "How It Works", href: "/how-it-works", match: "/how-it-works" },
  { label: "Pricing", href: "/pricing", match: "/pricing" },
  { label: "Safety", href: "/safety", match: "/safety" },
] as const;

export function isMarketingNavActive(
  pathname: string,
  match: string,
): boolean {
  if (match === "/safety") {
    return pathname === "/safety" || pathname.includes("safety");
  }
  return pathname === match || pathname.startsWith(`${match}/`);
}

export const marketingFooterNav = [
  {
    title: "Platform",
    items: [
      { label: "Hire Pilots", href: "/for-clients" },
      { label: "Join as Pilot", href: "/for-pilots" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Safety Standards", href: "/safety" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;
