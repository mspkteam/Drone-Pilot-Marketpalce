import type { ProfileStrengthItem } from "@/components/dashboard/shared/profile/ProfileStrengthPanel";
import { parsePortfolioJson } from "@/lib/pilot/portfolio";
import { parseProfileExtrasJson } from "@/lib/pilot/profile-extras";

type PilotStrengthForm = {
  bio: string;
  servicesOffered: string[];
};

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

type PilotStrengthInput = {
  form: PilotStrengthForm;
  avatarPreview: string | null;
  portfolioCount: number;
  insuranceVerified: boolean;
};

export function computePilotProfileStrength({
  form,
  avatarPreview,
  portfolioCount,
  insuranceVerified,
}: PilotStrengthInput): { pct: number; items: ProfileStrengthItem[] } {
  const photoDone = Boolean(avatarPreview);
  const bioDone = Boolean(form.bio.trim());
  const servicesDone = form.servicesOffered.length > 0;
  const portfolioStatus: ProfileStrengthItem["status"] =
    portfolioCount >= 8 ? "done" : portfolioCount > 0 ? "partial" : "missing";
  const insuranceStatus: ProfileStrengthItem["status"] = insuranceVerified
    ? "done"
    : "missing";

  const items: ProfileStrengthItem[] = [
    { label: "Photo", status: photoDone ? "done" : "missing" },
    { label: "Bio", status: bioDone ? "done" : "missing" },
    { label: "Services", status: servicesDone ? "done" : "missing" },
    {
      label: `Portfolio (${portfolioCount}/8)`,
      status: portfolioStatus,
    },
    { label: "Insurance", status: insuranceStatus },
  ];

  const score =
    (photoDone ? 20 : 0) +
    (bioDone ? 20 : 0) +
    (servicesDone ? 20 : 0) +
    (portfolioCount >= 8 ? 20 : portfolioCount > 0 ? 12 : 0) +
    (insuranceVerified ? 20 : 0);

  return { pct: Math.min(100, score), items };
}

/** Server-safe progress % for the dashboard rank card (not grade-based). */
export function computePilotGradeProgressPct(profile: {
  bio: string | null;
  servicesOffered: string;
  portfolioJson: string | null;
  profileExtrasJson: string | null;
  insuranceVerified?: boolean;
}): number {
  const extras = parseProfileExtrasJson(profile.profileExtrasJson);
  const services = parseServicesJson(profile.servicesOffered);
  const portfolioCount = parsePortfolioJson(profile.portfolioJson).length;
  return computePilotProfileStrength({
    form: {
      bio: profile.bio ?? "",
      servicesOffered: services,
    },
    avatarPreview: extras.avatarUrl,
    portfolioCount,
    insuranceVerified: Boolean(profile.insuranceVerified),
  }).pct;
}
