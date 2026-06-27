import {
  ACTIVE_MILESTONE,
  MILESTONE_DEFINITIONS,
  ROUTE_MILESTONE_RULES,
  type MilestoneDefinition,
  type RouteMilestoneRule,
} from "@/lib/milestones";
import { isAdminRole, type UserRole } from "@/types/roles";

export type RouteMilestoneMatch = {
  rule: RouteMilestoneRule;
  milestone: MilestoneDefinition;
};

function parseActiveMilestoneFromEnv(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) return null;
  return parsed;
}

/** Active milestone — override with MILESTONE_ACTIVE or NEXT_PUBLIC_MILESTONE_ACTIVE. */
export function getActiveMilestone(): number {
  const fromPublic = parseActiveMilestoneFromEnv(
    process.env.NEXT_PUBLIC_MILESTONE_ACTIVE,
  );
  if (fromPublic != null) return fromPublic;

  const fromServer = parseActiveMilestoneFromEnv(process.env.MILESTONE_ACTIVE);
  if (fromServer != null) return fromServer;

  return ACTIVE_MILESTONE;
}

export function getMilestoneDefinition(
  milestoneNumber: number,
): MilestoneDefinition | undefined {
  return MILESTONE_DEFINITIONS.find((m) => m.number === milestoneNumber);
}

export function getActiveMilestoneDefinition(): MilestoneDefinition {
  return (
    getMilestoneDefinition(getActiveMilestone()) ?? MILESTONE_DEFINITIONS[0]
  );
}

export function isMilestoneUnlocked(requiredMilestone: number): boolean {
  return requiredMilestone <= getActiveMilestone();
}

export function getLockedMilestoneMessage(requiredMilestone: number): string {
  const required = getMilestoneDefinition(requiredMilestone);
  const active = getActiveMilestoneDefinition();
  if (!required) {
    return "This feature is not available in the current release milestone.";
  }
  return `This feature is scheduled for ${required.weekLabel} — ${required.title}. We are currently completing ${active.weekLabel} — ${active.title}. This section will become available after the current milestone is signed off.`;
}

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function matchRouteRule(pathname: string): RouteMilestoneRule | null {
  const normalized = normalizePathname(pathname);
  const sorted = [...ROUTE_MILESTONE_RULES].sort(
    (a, b) => b.pathPrefix.length - a.pathPrefix.length,
  );

  for (const rule of sorted) {
    if (normalized === rule.pathPrefix) return rule;
    if (normalized.startsWith(`${rule.pathPrefix}/`)) return rule;
  }

  return null;
}

export function getRouteMilestone(pathname: string): RouteMilestoneMatch | null {
  const rule = matchRouteRule(pathname);
  if (!rule) return null;

  const milestone = getMilestoneDefinition(rule.milestone);
  if (!milestone) return null;

  return { rule, milestone };
}

export function isPublicDashboardPath(pathname: string): boolean {
  return !normalizePathname(pathname).startsWith("/dashboard");
}

/** Dev/admin preview — requires ALLOW_MILESTONE_PREVIEW=true and admin role. */
export function canBypassMilestoneLock(role: UserRole | undefined): boolean {
  if (!role || !isAdminRole(role)) return false;

  const previewFlag =
    process.env.NEXT_PUBLIC_ALLOW_MILESTONE_PREVIEW ??
    process.env.ALLOW_MILESTONE_PREVIEW;

  return previewFlag === "true" || previewFlag === "1";
}

export type MilestoneAccessResult = {
  allowed: boolean;
  bypassed: boolean;
  match: RouteMilestoneMatch | null;
  requiredMilestone: number | null;
};

export function evaluateMilestoneAccess(
  pathname: string,
  role?: UserRole,
): MilestoneAccessResult {
  if (isPublicDashboardPath(pathname)) {
    return {
      allowed: true,
      bypassed: false,
      match: null,
      requiredMilestone: null,
    };
  }

  const match = getRouteMilestone(pathname);
  if (!match) {
    return {
      allowed: true,
      bypassed: false,
      match: null,
      requiredMilestone: null,
    };
  }

  if (match.rule.alwaysUnlocked) {
    return {
      allowed: true,
      bypassed: false,
      match,
      requiredMilestone: match.rule.milestone,
    };
  }

  if (canBypassMilestoneLock(role)) {
    return {
      allowed: true,
      bypassed: true,
      match,
      requiredMilestone: match.rule.milestone,
    };
  }

  const allowed = isMilestoneUnlocked(match.rule.milestone);
  return {
    allowed,
    bypassed: false,
    match,
    requiredMilestone: match.rule.milestone,
  };
}

export function isNavHrefLocked(href: string): boolean {
  const access = evaluateMilestoneAccess(href);
  if (!access.match) return false;
  if (access.match.rule.alwaysUnlocked) return false;
  return !access.allowed;
}

export function getNavHrefMilestone(href: string): number | null {
  return getRouteMilestone(href)?.rule.milestone ?? null;
}

export function getCurrentWeekFeaturesHref(role: UserRole | undefined): string {
  switch (role) {
    case "client":
      return "/dashboard/client";
    case "pilot":
      return getActiveMilestone() >= 3
        ? "/dashboard/pilot"
        : "/dashboard/client";
    case "moderator":
    case "super_admin":
      return getActiveMilestone() >= 2
        ? "/dashboard/admin"
        : "/dashboard/client";
    default:
      return "/dashboard/client";
  }
}
