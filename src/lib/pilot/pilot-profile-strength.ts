import type { ProfileStrengthItem } from "@/components/dashboard/shared/profile/ProfileStrengthPanel";
import type { PilotFormState } from "@/components/pilot/PilotProfileFormFields";

type PilotStrengthInput = {
  form: PilotFormState;
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
