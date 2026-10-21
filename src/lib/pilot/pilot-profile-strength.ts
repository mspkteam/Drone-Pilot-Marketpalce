import type { ProfileStrengthItem } from "@/components/dashboard/shared/profile/ProfileStrengthPanel";
import { parsePortfolioJson } from "@/lib/pilot/portfolio";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";
import { servicesOfferedForSave } from "@/lib/pilot/pilot-profile-service-chips";

const PORTFOLIO_TARGET = 8;

type PilotStrengthForm = {
  displayName?: string;
  bio: string;
  locationCity?: string;
  locationCountry?: string;
  servicesOffered: string[];
  complianceAcknowledged?: string[];
};

type PilotStrengthExtras = {
  avatarPreview: string | null;
  mainDrones?: string[];
  payloads?: string[];
  localChipIds?: string[];
};

type PilotStrengthInput = {
  form: PilotStrengthForm;
  avatarPreview: string | null;
  portfolioCount: number;
  insuranceVerified: boolean;
  mainDrones?: string[];
  payloads?: string[];
  localChipIds?: string[];
  complianceAccepted?: boolean;
};

function isRealDisplayName(name: string | undefined): boolean {
  const trimmed = name?.trim() ?? "";
  if (trimmed.length < 2) return false;
  return trimmed.toLowerCase() !== "new pilot";
}

function portfolioScore(count: number, maxPoints: number): {
  points: number;
  status: ProfileStrengthItem["status"];
} {
  if (count <= 0) return { points: 0, status: "missing" };
  if (count >= PORTFOLIO_TARGET) return { points: maxPoints, status: "done" };
  return {
    points: Math.round((count / PORTFOLIO_TARGET) * maxPoints),
    status: "partial",
  };
}

/**
 * Single source of truth for PROFILE STRENGTH % (profile page + dashboard).
 * Weights sum to 100 and track fields pilots actually fill during onboarding.
 */
export function computePilotProfileStrength({
  form,
  avatarPreview,
  portfolioCount,
  insuranceVerified,
  mainDrones = [],
  payloads = [],
  localChipIds = [],
  complianceAccepted = false,
}: PilotStrengthInput): { pct: number; items: ProfileStrengthItem[] } {
  const nameDone = isRealDisplayName(form.displayName);
  const photoDone = Boolean(avatarPreview?.trim());
  const bioDone = Boolean(form.bio.trim());
  const locationDone = Boolean(
    form.locationCity?.trim() && form.locationCountry?.trim(),
  );
  const services = servicesOfferedForSave(
    form.servicesOffered,
    localChipIds,
  );
  const servicesDone = services.length > 0;
  const equipmentDone =
    mainDrones.some((d) => d.trim()) || payloads.some((p) => p.trim());
  const complianceDone =
    complianceAccepted ||
    (Array.isArray(form.complianceAcknowledged) &&
      form.complianceAcknowledged.length >= 4);
  const portfolio = portfolioScore(portfolioCount, 20);

  const items: ProfileStrengthItem[] = [
    { label: "Display name", status: nameDone ? "done" : "missing" },
    { label: "Photo", status: photoDone ? "done" : "missing" },
    { label: "Bio", status: bioDone ? "done" : "missing" },
    { label: "Location", status: locationDone ? "done" : "missing" },
    { label: "Services", status: servicesDone ? "done" : "missing" },
    {
      label: `Portfolio (${Math.min(portfolioCount, PORTFOLIO_TARGET)}/${PORTFOLIO_TARGET})`,
      status: portfolio.status,
    },
    { label: "Equipment", status: equipmentDone ? "done" : "missing" },
    { label: "Compliance", status: complianceDone ? "done" : "missing" },
    { label: "Insurance", status: insuranceVerified ? "done" : "missing" },
  ];

  const score =
    (nameDone ? 10 : 0) +
    (photoDone ? 10 : 0) +
    (bioDone ? 10 : 0) +
    (locationDone ? 10 : 0) +
    (servicesDone ? 10 : 0) +
    portfolio.points +
    (equipmentDone ? 10 : 0) +
    (complianceDone ? 10 : 0) +
    (insuranceVerified ? 10 : 0);

  return { pct: Math.min(100, Math.max(0, score)), items };
}

/** Local parse — do not import `@/lib/pilot/profile` (pulls Prisma into the client bundle). */
function parseServicesJson(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

/** Server-safe progress % from a persisted PilotProfile row. */
export function computePilotGradeProgressPct(profile: {
  displayName?: string | null;
  bio: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  servicesOffered: string;
  portfolioJson: string | null;
  profileExtrasJson: string | null;
  complianceAcceptedAt?: Date | string | null;
  insuranceVerified?: boolean;
}): number {
  return computePilotProfileStrengthFromProfile(profile).pct;
}

export function computePilotProfileStrengthFromProfile(profile: {
  displayName?: string | null;
  bio: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  servicesOffered: string;
  portfolioJson: string | null;
  profileExtrasJson: string | null;
  complianceAcceptedAt?: Date | string | null;
  insuranceVerified?: boolean;
}): { pct: number; items: ProfileStrengthItem[] } {
  const extras = parseProfileExtrasJson(profile.profileExtrasJson);
  const services = parseServicesJson(profile.servicesOffered);
  const portfolioCount = parsePortfolioJson(profile.portfolioJson).length;
  return computePilotProfileStrength({
    form: {
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      locationCity: profile.locationCity ?? "",
      locationCountry: profile.locationCountry ?? "",
      servicesOffered: services,
    },
    avatarPreview: extras.avatarUrl,
    portfolioCount,
    insuranceVerified: Boolean(profile.insuranceVerified),
    mainDrones: extras.mainDrones,
    payloads: extras.payloads,
    localChipIds: extras.localChipIds,
    complianceAccepted: Boolean(profile.complianceAcceptedAt),
  });
}

export type { PilotStrengthExtras };
