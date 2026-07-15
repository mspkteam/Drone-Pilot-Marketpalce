export const USER_ROLES = [
  "guest",
  "client",
  "pilot",
  "moderator",
  "admin",
  "super_admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Ops staff who can access `/dashboard/admin` (with role-specific limits). */
export const ADMIN_ROLES = ["moderator", "admin", "super_admin"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

/**
 * Management users that only Super Admin may create or delete.
 * (Super Admin itself is not creatable/deletable via this flow.)
 */
export const MANAGEMENT_USER_ROLES = ["admin", "moderator"] as const;

export type ManagementUserRole = (typeof MANAGEMENT_USER_ROLES)[number];

/** Roles allowed on public registration (M02) */
export const REGISTERABLE_ROLES = ["client", "pilot"] as const;

export type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export function isRegisterableRole(value: string): value is RegisterableRole {
  return value === "client" || value === "pilot";
}

export function isAdminRole(role: UserRole): boolean {
  return (
    role === "moderator" || role === "admin" || role === "super_admin"
  );
}

/** Full ops access (Admin + Super Admin) — bypasses moderator permission maps. */
export function isFullAdminRole(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export function isManagementUserRole(
  role: string,
): role is ManagementUserRole {
  return role === "admin" || role === "moderator";
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export type DashboardRole = "pilot" | "client" | "admin";

export function isDashboardRole(value: string): value is DashboardRole {
  return value === "pilot" || value === "client" || value === "admin";
}
