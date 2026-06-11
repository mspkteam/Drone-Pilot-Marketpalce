export type DashboardNavIconId =
  | "dashboard"
  | "marketplace"
  | "locked-jobs"
  | "proposals"
  | "contracts"
  | "messages"
  | "profile"
  | "verification"
  | "portfolio"
  | "reviews"
  | "earnings"
  | "membership"
  | "shop"
  | "support"
  | "settings"
  | "jobs"
  | "bookings"
  | "payments"
  | "users"
  | "pilots"
  | "clients"
  | "applications"
  | "subscriptions"
  | "disputes"
  | "achievements"
  | "certificates"
  | "wings"
  | "onboarding"
  | "waitlist"
  | "reports"
  | "cms";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: DashboardNavIconId;
  /** Pathnames that should not activate this item via prefix match. */
  activeExclude?: readonly string[];
};

export type DashboardNavGroup = {
  label: string;
  items: readonly DashboardNavItem[];
};

export type DashboardShellUser = {
  displayName: string;
  subtitle: string;
  initials: string;
};

export type DashboardRankCardData = {
  callSign: string;
  rankLabel: string;
  progressPct: number;
};
