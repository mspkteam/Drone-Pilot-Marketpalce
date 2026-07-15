import {
  ADMIN_ROUTE_MIN_ROLE,
  getDashboardHomeForRole,
} from "@/lib/auth/config";
import type { DashboardRole } from "@/types/roles";
import { isAdminRole, type UserRole } from "@/types/roles";

export { getDashboardHomeForRole };

export function getDashboardTypeFromPath(
  pathname: string,
): DashboardRole | null {
  if (pathname.startsWith("/dashboard/pilot")) return "pilot";
  if (pathname.startsWith("/dashboard/client")) return "client";
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  return null;
}

export function canAccessDashboard(
  role: UserRole,
  dashboard: DashboardRole,
): boolean {
  switch (dashboard) {
    case "pilot":
      return role === "pilot";
    case "client":
      return role === "client";
    case "admin":
      return isAdminRole(role);
    default:
      return false;
  }
}

/** Super-admin-only routes; null means moderator+ can access */
export function getRequiredAdminRole(pathname: string): UserRole | null {
  for (const [route, minRole] of Object.entries(ADMIN_ROUTE_MIN_ROLE)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return minRole;
    }
  }
  return null;
}

/**
 * Role hierarchy for admin surfaces:
 * super_admin > admin > moderator
 */
export function roleMeetsRequirement(
  userRole: UserRole,
  required: UserRole,
): boolean {
  if (required === "super_admin") return userRole === "super_admin";
  if (required === "admin") {
    return userRole === "admin" || userRole === "super_admin";
  }
  if (required === "moderator") return isAdminRole(userRole);
  return userRole === required;
}

export function canAccessAdminPath(
  userRole: UserRole,
  pathname: string,
): boolean {
  if (!isAdminRole(userRole)) return false;
  const required = getRequiredAdminRole(pathname);
  if (!required) return true;
  return roleMeetsRequirement(userRole, required);
}

/** Post-login redirect respecting role and optional callback URL */
export function resolvePostLoginRedirect(
  role: UserRole,
  callbackUrl: string | null,
): string {
  const fallback = getDashboardHomeForRole(role);
  if (!callbackUrl || !callbackUrl.startsWith("/dashboard")) {
    return fallback;
  }
  const type = getDashboardTypeFromPath(callbackUrl);
  if (!type || !canAccessDashboard(role, type)) {
    return fallback;
  }
  if (type === "admin" && !canAccessAdminPath(role, callbackUrl)) {
    return "/dashboard/admin";
  }
  return callbackUrl;
}
