import type { UserRole } from "@/types/roles";

/** Official 5-week delivery schedule — change this (or env) to unlock the next milestone. */
export const ACTIVE_MILESTONE = 3;

export type MilestoneStatus = "locked" | "in_progress" | "complete";

export type MilestoneDefinition = {
  number: number;
  weekLabel: string;
  title: string;
  dateRange: string;
  status: MilestoneStatus;
  summary: string;
  lockedMessage: string;
};

export const MILESTONE_DEFINITIONS: readonly MilestoneDefinition[] = [
  {
    number: 1,
    weekLabel: "Week 1",
    title: "Client",
    dateRange: "2 Jul – 6 Jul 2026",
    status: "complete",
    summary: "Client posting, projects, bids, find pilots, dashboard, messages, disputes, and profile.",
    lockedMessage:
      "This section is part of Milestone 1 — Client. Client dashboard features are available during Week 1.",
  },
  {
    number: 2,
    weekLabel: "Week 2",
    title: "Admin & Moderator",
    dateRange: "9 Jul – 13 Jul 2026",
    status: "complete",
    summary:
      "Job approval, fleet, disputes, commissions, permissions, CMS, configuration, certificates, badges, shop, and subscriptions.",
    lockedMessage:
      "This section is part of Milestone 2 — Admin & Moderator. It unlocks after Week 1 sign-off.",
  },
  {
    number: 3,
    weekLabel: "Week 3",
    title: "Pilot",
    dateRange: "16 Jul – 20 Jul 2026",
    status: "in_progress",
    summary:
      "Marketplace, proposals, contracts, delivery, membership, messages, portfolio, reviews, shop, and verifications.",
    lockedMessage:
      "This section is part of Milestone 3 — Pilot. It unlocks after Week 2 sign-off.",
  },
  {
    number: 4,
    weekLabel: "Week 4",
    title: "Bug Fixes & Hardening",
    dateRange: "23 Jul – 27 Jul 2026",
    status: "locked",
    summary:
      "Cross-role fixes, security, performance, Stripe payments, file uploads, and mock data removal.",
    lockedMessage:
      "This section is part of Milestone 4 — Bug Fixes & Hardening. It unlocks after Week 3 sign-off.",
  },
  {
    number: 5,
    weekLabel: "Week 5",
    title: "Testing & Launch",
    dateRange: "30 Jul – 3 Aug 2026",
    status: "locked",
    summary:
      "E2E testing, accessibility, SEO, analytics, load testing, launch checklist, and visual QA.",
    lockedMessage:
      "This section is part of Milestone 5 — Testing & Launch. It unlocks after Week 4 sign-off.",
  },
] as const;

export type RouteMilestoneRule = {
  /** Longest-prefix match wins (rules sorted by prefix length descending). */
  pathPrefix: string;
  milestone: number;
  featureKey: string;
  featureLabel: string;
  /** Accessible even when milestone is locked (onboarding, etc.). */
  alwaysUnlocked?: boolean;
  allowedRoles?: readonly UserRole[];
};

/**
 * Dashboard route → milestone mapping.
 * Public marketing, legal, and auth routes are not listed here (always open).
 */
export const ROUTE_MILESTONE_RULES: readonly RouteMilestoneRule[] = [
  // ——— Week 1 — Client ———
  {
    pathPrefix: "/dashboard/client/onboarding",
    milestone: 1,
    featureKey: "client.onboarding",
    featureLabel: "Client Onboarding",
    alwaysUnlocked: true,
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/jobs/new",
    milestone: 1,
    featureKey: "client.post-project",
    featureLabel: "Post a Project",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/jobs/",
    milestone: 1,
    featureKey: "client.project-detail",
    featureLabel: "Project Detail & Bids",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/jobs",
    milestone: 1,
    featureKey: "client.my-projects",
    featureLabel: "My Projects",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/quotes",
    milestone: 1,
    featureKey: "client.project-bids",
    featureLabel: "Project Bids",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/find-pilots",
    milestone: 1,
    featureKey: "client.find-pilots",
    featureLabel: "Find Pilots Directory",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/messages",
    milestone: 1,
    featureKey: "client.messages",
    featureLabel: "Messages",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/disputes",
    milestone: 1,
    featureKey: "client.disputes",
    featureLabel: "Client Disputes",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/profile",
    milestone: 1,
    featureKey: "client.profile",
    featureLabel: "Client Profile",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/settings",
    milestone: 1,
    featureKey: "client.settings",
    featureLabel: "Client Settings",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client",
    milestone: 1,
    featureKey: "client.dashboard",
    featureLabel: "Client Dashboard",
    allowedRoles: ["client"],
  },

  // ——— Week 3 — Client booking views (accept flow lands later) ———
  {
    pathPrefix: "/dashboard/client/bookings",
    milestone: 3,
    featureKey: "client.bookings",
    featureLabel: "Client Bookings",
    allowedRoles: ["client"],
  },
  {
    pathPrefix: "/dashboard/client/reviews",
    milestone: 3,
    featureKey: "client.reviews",
    featureLabel: "Client Reviews",
    allowedRoles: ["client"],
  },

  // ——— Week 4 — Client billing ———
  {
    pathPrefix: "/dashboard/client/payments",
    milestone: 4,
    featureKey: "client.billing",
    featureLabel: "Client Billing & Payments",
    allowedRoles: ["client"],
  },

  // ——— Week 2 — Admin & Moderator ———
  {
    pathPrefix: "/dashboard/admin/permissions",
    milestone: 2,
    featureKey: "admin.permissions",
    featureLabel: "Moderator Permissions",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/settings",
    milestone: 2,
    featureKey: "admin.configuration",
    featureLabel: "Platform Configuration",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/cms",
    milestone: 2,
    featureKey: "admin.cms",
    featureLabel: "CMS Articles & Resources",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/shop",
    milestone: 2,
    featureKey: "admin.shop",
    featureLabel: "Uniform Shop Admin",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/achievements",
    milestone: 2,
    featureKey: "admin.badges",
    featureLabel: "Badges & Wings",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/certificates",
    milestone: 2,
    featureKey: "admin.certificates",
    featureLabel: "Certificates Engine",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/payments",
    milestone: 2,
    featureKey: "admin.commissions",
    featureLabel: "Commissions Ledger",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/subscriptions",
    milestone: 2,
    featureKey: "admin.subscriptions",
    featureLabel: "Subscriptions Admin",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/disputes",
    milestone: 2,
    featureKey: "admin.disputes",
    featureLabel: "Dispute Centre",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/squadron-voting",
    milestone: 2,
    featureKey: "admin.squadron-voting",
    featureLabel: "Squadron Voting",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/regions",
    milestone: 2,
    featureKey: "admin.regions",
    featureLabel: "Regions",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/verifications",
    milestone: 2,
    featureKey: "admin.verifications",
    featureLabel: "Pilot Verification",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/jobs",
    milestone: 2,
    featureKey: "admin.job-approval",
    featureLabel: "Job Approval Queue",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/users",
    milestone: 2,
    featureKey: "admin.fleet-personnel",
    featureLabel: "Fleet & Personnel",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/reports",
    milestone: 2,
    featureKey: "admin.reports",
    featureLabel: "Reports & Analytics",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/messages",
    milestone: 2,
    featureKey: "admin.messages",
    featureLabel: "Messages Tracking",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin/support",
    milestone: 2,
    featureKey: "admin.support",
    featureLabel: "Support Chat",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },
  {
    pathPrefix: "/dashboard/admin",
    milestone: 2,
    featureKey: "admin.dashboard",
    featureLabel: "Admin Operations Dashboard",
    allowedRoles: ["moderator", "admin", "super_admin"],
  },

  // ——— Week 3 — Pilot ———
  {
    pathPrefix: "/dashboard/pilot/onboarding",
    milestone: 3,
    featureKey: "pilot.onboarding",
    featureLabel: "Pilot Onboarding",
    alwaysUnlocked: true,
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/locked-jobs",
    milestone: 3,
    featureKey: "pilot.locked-jobs",
    featureLabel: "Locked Jobs & Countdown",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/proposals",
    milestone: 3,
    featureKey: "pilot.proposals",
    featureLabel: "My Proposals",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/contracts",
    milestone: 3,
    featureKey: "pilot.contracts",
    featureLabel: "Active Contracts",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/jobs",
    milestone: 3,
    featureKey: "pilot.marketplace",
    featureLabel: "Marketplace Job Listings",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/messages",
    milestone: 3,
    featureKey: "pilot.messages",
    featureLabel: "Pilot Messages",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/profile",
    milestone: 3,
    featureKey: "pilot.profile",
    featureLabel: "Pilot Profile & Strength",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/applications",
    milestone: 3,
    featureKey: "pilot.applications",
    featureLabel: "Applications",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/bookings",
    milestone: 3,
    featureKey: "pilot.bookings",
    featureLabel: "Bookings & Delivery",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot",
    milestone: 3,
    featureKey: "pilot.dashboard",
    featureLabel: "Pilot Dashboard",
    allowedRoles: ["pilot"],
  },

  // ——— Deferred pilot modules (resume after current UI pass; Week 4 badge) ———
  {
    pathPrefix: "/dashboard/pilot/portfolio",
    milestone: 4,
    featureKey: "pilot.portfolio",
    featureLabel: "Portfolio Gallery",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/verifications",
    milestone: 4,
    featureKey: "pilot.verifications",
    featureLabel: "Verifications",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/reviews",
    milestone: 4,
    featureKey: "pilot.reviews",
    featureLabel: "Pilot Reviews",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/support",
    milestone: 4,
    featureKey: "pilot.support",
    featureLabel: "Pilot Support",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/settings",
    milestone: 4,
    featureKey: "pilot.settings",
    featureLabel: "Pilot Settings",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/payments",
    milestone: 4,
    featureKey: "pilot.payments",
    featureLabel: "Pilot Earnings & Payouts",
    allowedRoles: ["pilot"],
  },
  {
    pathPrefix: "/dashboard/pilot/subscription",
    milestone: 4,
    featureKey: "pilot.subscription",
    featureLabel: "Membership & Upgrades",
    allowedRoles: ["pilot"],
  },

  // ——— Week 4 — Pilot shop checkout ———
  {
    pathPrefix: "/dashboard/pilot/shop",
    milestone: 4,
    featureKey: "pilot.shop",
    featureLabel: "Uniform Shop Checkout",
    allowedRoles: ["pilot"],
  },
] as const;

/** Nav badge copy for locked milestones. */
export function getMilestoneBadgeLabel(milestone: number): string {
  const def = MILESTONE_DEFINITIONS.find((m) => m.number === milestone);
  return def ? def.weekLabel : `Week ${milestone}`;
}
