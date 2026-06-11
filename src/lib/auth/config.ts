import type { UserRole } from "@/types/roles";

/**
 * Route protection map — enforced in M02 (Authentication).
 * Sprint 1: documentation + middleware placeholder only.
 */
export const PUBLIC_PATHS = [
  "/",
  "/for-clients",
  "/for-pilots",
  "/pricing",
  "/how-it-works",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/cookies",
  "/resources",
  "/safety",
  "/login",
  "/register",
  "/waitlist",
] as const;

export const AUTH_PATHS = ["/login", "/register", "/waitlist"] as const;

export const DASHBOARD_PREFIX = "/dashboard";

export const ROLE_DASHBOARD_PATH: Record<
  Exclude<UserRole, "guest">,
  string | null
> = {
  client: "/dashboard/client",
  pilot: "/dashboard/pilot",
  moderator: "/dashboard/admin",
  super_admin: "/dashboard/admin",
};

/** Minimum role for admin sub-routes (M02+) */
export const ADMIN_ROUTE_MIN_ROLE: Record<string, UserRole> = {
  "/dashboard/admin/permissions": "super_admin",
};

export function getDashboardHomeForRole(role: UserRole): string {
  if (role === "guest") return "/login";
  return ROLE_DASHBOARD_PATH[role] ?? "/login";
}
