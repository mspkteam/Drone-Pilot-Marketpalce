import type { DashboardNavGroup } from "@/types/dashboard-nav";

/** Pilot dashboard nav — grouped per Figma flight-deck shell (node 361:911). */
export const pilotNavGroups: readonly DashboardNavGroup[] = [
  {
    label: "Flight Deck",
    items: [{ label: "Dashboard", href: "/dashboard/pilot", icon: "dashboard" }],
  },
  {
    label: "Operations",
    items: [
      { label: "Marketplace", href: "/dashboard/pilot/jobs", icon: "marketplace" },
      {
        label: "Locked Jobs",
        href: "/dashboard/pilot/locked-jobs",
        icon: "locked-jobs",
      },
      { label: "My Proposals", href: "/dashboard/pilot/proposals", icon: "proposals" },
      { label: "Active Contracts", href: "/dashboard/pilot/contracts", icon: "contracts" },
      { label: "Messages", href: "/dashboard/pilot/messages", icon: "messages" },
    ],
  },
  {
    label: "Pilot",
    items: [
      { label: "Profile", href: "/dashboard/pilot/profile", icon: "profile" },
      { label: "Verification", href: "/dashboard/pilot/verifications", icon: "verification" },
      { label: "Portfolio", href: "/dashboard/pilot/portfolio", icon: "portfolio" },
      { label: "Reviews", href: "/dashboard/pilot/reviews", icon: "reviews" },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Earnings", href: "/dashboard/pilot/payments", icon: "earnings" },
      { label: "Membership", href: "/dashboard/pilot/subscription", icon: "membership" },
      { label: "Uniform Shop", href: "/dashboard/pilot/shop", icon: "shop" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Support", href: "/dashboard/pilot/support", icon: "support" },
      { label: "Settings", href: "/dashboard/pilot/settings", icon: "settings" },
    ],
  },
] as const;

/** Flat list preserved for compatibility checks and redirects. */
export const pilotNav = pilotNavGroups.flatMap((g) => g.items);
