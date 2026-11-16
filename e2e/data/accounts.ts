/** Demo / QA accounts. Prefer env overrides; never invent admin credentials. */
export const DEMO_PASSWORD =
  process.env.E2E_PASSWORD ??
  process.env.FINAL_QA_PASSWORD ??
  "Demo123!";

export const ACCOUNTS = {
  client: {
    email: process.env.E2E_CLIENT_EMAIL ?? "client@dronepilot.local",
    password: DEMO_PASSWORD,
    dashboard: "/dashboard/client",
    role: "client" as const,
  },
  pilot: {
    email: process.env.E2E_PILOT_EMAIL ?? "pilot@dronepilot.local",
    password: DEMO_PASSWORD,
    dashboard: "/dashboard/pilot",
    role: "pilot" as const,
  },
  pilotA1: {
    email: process.env.E2E_PILOT_A1_EMAIL ?? "pilot-a1@dronepilot.local",
    password: DEMO_PASSWORD,
    dashboard: "/dashboard/pilot",
    role: "pilot" as const,
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? "admin@dronepilot.local",
    password: process.env.E2E_ADMIN_PASSWORD ?? DEMO_PASSWORD,
    dashboard: "/dashboard/admin",
    role: "admin" as const,
  },
} as const;

export type AccountKey = keyof typeof ACCOUNTS;

/** True when admin credentials were explicitly provided or demo seed email is used. */
export function adminCredentialsAvailable(): boolean {
  return Boolean(
    process.env.E2E_ADMIN_EMAIL ||
      process.env.FINAL_QA_ADMIN_EMAIL ||
      process.env.SMOKE_ADMIN_EMAIL ||
      ACCOUNTS.admin.email === "admin@dronepilot.local",
  );
}

export const PUBLIC_MARKETING_PATHS = [
  "/",
  "/for-clients",
  "/for-pilots",
  "/how-it-works",
  "/pricing",
  "/about",
  "/contact",
  "/pilots",
  "/jobs",
  "/captains-club",
  "/reputation",
  "/resources",
  "/safety",
  "/privacy",
  "/terms",
  "/cookies",
  "/waitlist",
  "/login",
  "/register",
] as const;

export const CLIENT_DASHBOARD_PATHS = [
  "/dashboard/client",
  "/dashboard/client/profile",
  "/dashboard/client/onboarding",
  "/dashboard/client/jobs",
  "/dashboard/client/jobs/new",
  "/dashboard/client/find-pilots",
  "/dashboard/client/bookings",
  "/dashboard/client/messages",
  "/dashboard/client/payments",
  "/dashboard/client/reviews",
  "/dashboard/client/disputes",
  "/dashboard/client/quotes",
  "/dashboard/client/settings",
] as const;

export const PILOT_DASHBOARD_PATHS = [
  "/dashboard/pilot",
  "/dashboard/pilot/profile",
  "/dashboard/pilot/onboarding",
  "/dashboard/pilot/jobs",
  "/dashboard/pilot/applications",
  "/dashboard/pilot/proposals",
  "/dashboard/pilot/bookings",
  "/dashboard/pilot/messages",
  "/dashboard/pilot/payments",
  "/dashboard/pilot/reviews",
  "/dashboard/pilot/subscription",
  "/dashboard/pilot/verifications",
  "/dashboard/pilot/portfolio",
  "/dashboard/pilot/certificates",
  "/dashboard/pilot/achievements",
  "/dashboard/pilot/shop",
  "/dashboard/pilot/support",
  "/dashboard/pilot/settings",
  "/dashboard/pilot/locked-jobs",
  "/dashboard/pilot/disputes",
] as const;

export const ADMIN_DASHBOARD_PATHS = [
  "/dashboard/admin",
  "/dashboard/admin/users",
  "/dashboard/admin/pilots",
  "/dashboard/admin/clients",
  "/dashboard/admin/jobs",
  "/dashboard/admin/applications",
  "/dashboard/admin/bookings",
  "/dashboard/admin/payments",
  "/dashboard/admin/subscriptions",
  "/dashboard/admin/verifications",
  "/dashboard/admin/disputes",
  "/dashboard/admin/messages",
  "/dashboard/admin/reviews",
  "/dashboard/admin/reports",
  "/dashboard/admin/settings",
  "/dashboard/admin/configuration",
  "/dashboard/admin/waitlist",
  "/dashboard/admin/support",
] as const;

export const RESPONSIVE_VIEWPORTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "390x844", width: 390, height: 844 },
  { name: "375x812", width: 375, height: 812 },
] as const;
