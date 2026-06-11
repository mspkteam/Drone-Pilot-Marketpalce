import type { ProfileStrengthItem } from "@/components/dashboard/shared/profile/ProfileStrengthPanel";
import type { ClientFormState } from "@/components/client/ClientProfileFormFields";

type ClientUiState = {
  roleTitle: string;
  location: string;
  projectTypes: string[];
  paymentConnected: boolean;
};

export function computeClientProfileStrength(
  form: ClientFormState,
  ui: ClientUiState,
): { pct: number; items: ProfileStrengthItem[] } {
  const contactDone =
    Boolean(form.contactName.trim()) && Boolean(form.phone.trim());
  const companyDone = Boolean(form.companyName.trim()) && Boolean(ui.roleTitle.trim());
  const prefsStatus: ProfileStrengthItem["status"] =
    ui.projectTypes.length >= 3
      ? "done"
      : ui.projectTypes.length > 0
        ? "partial"
        : "missing";
  const paymentStatus: ProfileStrengthItem["status"] = ui.paymentConnected
    ? "done"
    : "missing";

  const items: ProfileStrengthItem[] = [
    { label: "Contact Info", status: contactDone ? "done" : "missing" },
    { label: "Company Details", status: companyDone ? "done" : "missing" },
    { label: "Project Preferences", status: prefsStatus },
    { label: "Payment Method", status: paymentStatus },
  ];

  const score =
    (contactDone ? 25 : 0) +
    (companyDone ? 25 : 0) +
    (prefsStatus === "done" ? 25 : prefsStatus === "partial" ? 15 : 0) +
    (ui.paymentConnected ? 25 : 0);

  return { pct: Math.min(100, score), items };
}
