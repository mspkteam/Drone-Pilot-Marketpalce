import type { DashboardRankCardData, DashboardShellUser } from "@/types/dashboard-nav";
import { parseClientProfilePreferences } from "@/lib/client/preferences";
import { HOME_PILOT_RANKS } from "@/lib/marketing/home-content";
import { TIER_CODE_TO_PRICING_PLAN_CODE } from "@/lib/marketing/pricing-pilot-context";

type SessionUser = {
  email?: string | null;
  role?: string | null;
};

function initialsFromLabel(label: string): string {
  const parts = label.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
  }
  return label.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase();
}

type ClientProfileShellInput = {
  contactName: string;
  companyName: string | null;
  preferencesJson?: string | null;
};

export function buildClientShellUser(
  sessionUser: SessionUser,
  profile: ClientProfileShellInput | null,
): DashboardShellUser {
  const displayName =
    profile?.contactName.trim() ||
    profile?.companyName?.trim() ||
    sessionUser.email?.split("@")[0] ||
    "Client";

  const avatarUrl =
    profile?.preferencesJson !== undefined
      ? parseClientProfilePreferences(profile?.preferencesJson).logoPath ?? null
      : null;

  return buildDashboardUser(sessionUser, {
    displayName,
    roleSubtitle: "Client account",
    avatarUrl,
  });
}

export function buildDashboardUser(
  sessionUser: SessionUser,
  options?: {
    displayName?: string | null;
    roleSubtitle?: string;
    avatarUrl?: string | null;
  },
): DashboardShellUser {
  const email = sessionUser.email ?? "Account";
  const label = options?.displayName?.trim() ?? email;
  const initials = initialsFromLabel(label) || "?";

  const displayName =
    options?.displayName?.trim() ||
    email.split("@")[0]?.toUpperCase() ||
    "OPERATOR";

  const roleSubtitle =
    options?.roleSubtitle ??
    (sessionUser.role === "pilot"
      ? "Pilot account"
      : sessionUser.role === "client"
        ? "Client account"
        : sessionUser.role === "super_admin"
          ? "Super admin"
          : sessionUser.role === "admin"
            ? "Admin account"
            : sessionUser.role === "moderator"
              ? "Moderator account"
              : "Admin account");

  return {
    displayName,
    subtitle: roleSubtitle,
    initials,
    avatarUrl: options?.avatarUrl ?? null,
  };
}

export function rankLabelForTier(tierCode?: string | null): string {
  const pricingCode =
    (tierCode && TIER_CODE_TO_PRICING_PLAN_CODE[tierCode]) || "A-3";
  const rank = HOME_PILOT_RANKS.find((r) => r.code === pricingCode);
  if (!rank) return "A-3 FLIGHT OFFICER";
  return `${rank.code} ${rank.name}`;
}

export function buildPilotRankCard(options: {
  displayName: string;
  tierCode?: string | null;
  progressPct?: number;
}): DashboardRankCardData {
  return {
    callSign: options.displayName.trim(),
    rankLabel: rankLabelForTier(options.tierCode),
    progressPct: options.progressPct ?? 62,
  };
}

export function buildAdminRankCard(
  displayName: string,
  role: string | null | undefined,
): DashboardRankCardData {
  const callSign =
    role === "super_admin"
      ? "SUPER ADMIN"
      : role === "admin"
        ? "ADMIN"
        : role === "moderator"
          ? "MODERATOR"
          : "ADMIN";

  return {
    callSign,
    rankLabel: displayName.trim().toUpperCase() || "OFFICER",
    progressPct: 62,
    progressLabel: "Grade progress",
    ariaLabel: "Admin grade progress",
  };
}
