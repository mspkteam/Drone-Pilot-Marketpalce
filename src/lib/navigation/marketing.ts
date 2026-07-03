/** Primary marketing header nav — Figma global header. */
import { isMarketingNavHrefVisible } from "@/lib/public-access";

/** Figma 808 header — Hire Pilots, Join as Pilot, How It Works, Pricing, Safety */
export const marketingNav = [
  { label: "Hire Pilots", href: "/for-clients", match: "/for-clients" },
  { label: "Join as Pilot", href: "/for-pilots", match: "/for-pilots" },
  { label: "How It Works", href: "/how-it-works", match: "/how-it-works" },
  { label: "Pricing", href: "/pricing", match: "/pricing" },
  { label: "Safety", href: "/safety", match: "/safety" },
] as const;

export function getVisibleMarketingNav() {
  return marketingNav.filter((item) => isMarketingNavHrefVisible(item.href));
}

export function isMarketingNavActive(
  pathname: string,
  match: string,
): boolean {
  if (match === "/for-clients") {
    return (
      pathname === "/for-clients" ||
      pathname.startsWith("/for-clients/") ||
      pathname === "/pilots" ||
      pathname.startsWith("/pilots/")
    );
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
