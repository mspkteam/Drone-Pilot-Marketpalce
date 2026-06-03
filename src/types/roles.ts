export const USER_ROLES = [
  "guest",
  "client",
  "pilot",
  "moderator",
  "super_admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** Roles allowed on public registration (M02) */
export const REGISTERABLE_ROLES = ["client", "pilot"] as const;

export type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export function isRegisterableRole(value: string): value is RegisterableRole {
  return value === "client" || value === "pilot";
}

export function isAdminRole(role: UserRole): boolean {
  return role === "moderator" || role === "super_admin";
}

export type DashboardRole = "pilot" | "client" | "admin";

export function isDashboardRole(value: string): value is DashboardRole {
  return value === "pilot" || value === "client" || value === "admin";
}
