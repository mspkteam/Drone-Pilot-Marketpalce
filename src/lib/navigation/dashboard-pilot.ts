import type { DashboardNavGroup } from "@/types/dashboard-nav";

/** Pilot dashboard nav — grouped per Figma flight-deck shell (node 361:911). */
export function buildPilotNavGroups(options?: {
  /** When true, show Students under Business (active instructor add-on only). */
  instructorActive?: boolean;
  /**
   * When false, only show Profile / Verification / Portfolio / Settings / Support
   * so incomplete pilots are not bounced around and lose form state.
   */
  onboardingComplete?: boolean;
}): DashboardNavGroup[] {
  const onboardingComplete = options?.onboardingComplete !== false;

  if (!onboardingComplete) {
    return [
      {
        label: "Pilot",
        items: [
          { label: "Profile", href: "/dashboard/pilot/profile", icon: "profile" },
          {
            label: "Verification",
            href: "/dashboard/pilot/verifications",
            icon: "verification",
          },
          { label: "Portfolio", href: "/dashboard/pilot/portfolio", icon: "portfolio" },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "Support", href: "/dashboard/pilot/support", icon: "support" },
          { label: "Settings", href: "/dashboard/pilot/settings", icon: "settings" },
        ],
      },
    ];
  }

  const businessItems: DashboardNavGroup["items"] = [
    { label: "Earnings", href: "/dashboard/pilot/payments", icon: "earnings" },
    { label: "Membership", href: "/dashboard/pilot/subscription", icon: "membership" },
    { label: "Instructor", href: "/dashboard/pilot/instructor", icon: "wings" },
    ...(options?.instructorActive
      ? ([
          {
            label: "Students",
            href: "/dashboard/pilot/students",
            icon: "pilots" as const,
          },
        ] as const)
      : []),
    { label: "Uniform Shop", href: "/dashboard/pilot/shop", icon: "shop" },
  ];

  return [
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
        { label: "Disputes", href: "/dashboard/pilot/disputes", icon: "disputes" },
        { label: "Messages", href: "/dashboard/pilot/messages", icon: "messages" },
      ],
    },
    {
      label: "Pilot",
      items: [
        { label: "Profile", href: "/dashboard/pilot/profile", icon: "profile" },
        { label: "Verification", href: "/dashboard/pilot/verifications", icon: "verification" },
        {
          label: "Request Wings",
          href: "/dashboard/pilot/verifications/request-wings",
          icon: "wings",
        },
        { label: "Portfolio", href: "/dashboard/pilot/portfolio", icon: "portfolio" },
        { label: "Reviews", href: "/dashboard/pilot/reviews", icon: "reviews" },
        { label: "Certificates", href: "/dashboard/pilot/certificates", icon: "certificates" },
        { label: "Digital Wings", href: "/dashboard/pilot/achievements", icon: "achievements" },
      ],
    },
    {
      label: "Business",
      items: businessItems,
    },
    {
      label: "Account",
      items: [
        { label: "Support", href: "/dashboard/pilot/support", icon: "support" },
        { label: "Settings", href: "/dashboard/pilot/settings", icon: "settings" },
      ],
    },
  ];
}

/** Default nav (no instructor Students item). */
export const pilotNavGroups: readonly DashboardNavGroup[] = buildPilotNavGroups();

/** Flat list preserved for compatibility checks and redirects. */
export const pilotNav = pilotNavGroups.flatMap((g) => g.items);
