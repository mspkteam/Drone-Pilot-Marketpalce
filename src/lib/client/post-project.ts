import type { JobCategoryId } from "@/types/job";
import { formatIsoDateForDisplay } from "@/lib/format/date";
import {
  POST_PROJECT_DELIVERABLES,
  POST_PROJECT_PRIORITIES,
  POST_PROJECT_QUOTE_TYPES,
  POST_PROJECT_SERVICES,
  emptyPostProjectLocation,
  type PostProjectDeliverable,
  type PostProjectFormState,
  type PostProjectLocation,
  type PostProjectPriority,
  type PostProjectQuoteType,
  type PostProjectServiceId,
} from "@/lib/client/post-project-constants";
import {
  extractPostProjectMetadata,
  type JobPostProjectMetadata,
} from "@/lib/jobs/post-project-metadata";

export {
  POST_PROJECT_DELIVERABLES,
  POST_PROJECT_OFF_PLATFORM_ACKNOWLEDGMENT,
  POST_PROJECT_PRIORITIES,
  POST_PROJECT_QUOTE_TYPES,
  POST_PROJECT_SERVICES,
  emptyPostProjectLocation,
  emptyPostProjectTravelExpenses,
  initialPostProjectFormState,
  type PostProjectDeliverable,
  type PostProjectFormState,
  type PostProjectLocation,
  type PostProjectPriority,
  type PostProjectQuoteType,
  type PostProjectServiceId,
  type PostProjectTravelExpenses,
} from "@/lib/client/post-project-constants";

export const POST_PROJECT_STEPS = [
  { id: "service", label: "Service" },
  { id: "location", label: "Location" },
  { id: "requirements", label: "Requirements" },
  { id: "budget", label: "Budget & Timeline" },
  { id: "review", label: "Review" },
] as const;

export type PostProjectStepId = (typeof POST_PROJECT_STEPS)[number]["id"];

export function postProjectStepSubtitle(step: number): string {
  const total = POST_PROJECT_STEPS.length;
  const current = POST_PROJECT_STEPS[step];
  return `Step ${step + 1} of ${total} · ${current?.label ?? ""}`;
}

export function serviceLabel(serviceId: PostProjectServiceId | ""): string {
  if (!serviceId) return "—";
  return POST_PROJECT_SERVICES.find((s) => s.id === serviceId)?.label ?? "—";
}

export function serviceCategory(serviceId: PostProjectServiceId | ""): JobCategoryId {
  const found = POST_PROJECT_SERVICES.find((s) => s.id === serviceId);
  return (found?.category ?? "other") as JobCategoryId;
}

export function formatPostProjectLocation(locations: PostProjectLocation[]): string {
  const primary = locations[0];
  if (!primary) return "—";
  const parts = [primary.city, primary.state, primary.country].filter((p) => p.trim());
  if (parts.length) return parts.join(", ");
  if (primary.address.trim()) return primary.address;
  return "—";
}

function formatTravelExpenseAmount(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const amount = Number(trimmed);
  if (Number.isNaN(amount)) return trimmed;
  return `$${amount.toLocaleString()}`;
}

export type PostProjectTravelSummaryItem = {
  label: string;
  value: string;
  wide?: boolean;
};

export function buildPostProjectTravelSummary(
  form: PostProjectFormState,
): PostProjectTravelSummaryItem[] {
  if (form.coverTravelExpenses === null) return [];

  const covered = form.coverTravelExpenses;
  const lodgingAmount = formatTravelExpenseAmount(form.travelExpenses.lodging);
  const transportAmount = formatTravelExpenseAmount(form.travelExpenses.groundTransport);

  return [
    { label: "TRAVEL REQUIRED", value: covered ? "Yes" : "No" },
    {
      label: "LODGING",
      value: covered ? lodgingAmount ?? "Not Included" : "Not Included",
    },
    {
      label: "TRANSPORTATION",
      value: covered ? transportAmount ?? "Client to Provide" : "Pilot responsibility",
    },
    {
      label: "TRAVEL EXPENSES",
      value: covered ? "Covered by Client" : "Not covered by client",
      wide: true,
    },
  ];
}

export function formatPostProjectBudget(form: PostProjectFormState): string {
  const min = form.budgetMin.trim();
  const max = form.budgetMax.trim();
  if (min && max) {
    const minNum = Number(min).toLocaleString();
    const maxNum = Number(max).toLocaleString();
    return `$${minNum} - $${maxNum}`;
  }
  if (form.quoteType === "pilot_quotes") return "Pilot proposals";
  return "—";
}

export function formatPostProjectDeadline(form: PostProjectFormState): string {
  if (form.deadline.trim()) return formatIsoDateForDisplay(form.deadline);
  if (form.completionDate.trim()) return formatIsoDateForDisplay(form.completionDate);
  return "Flexible";
}

export function validatePostProjectStep(
  step: number,
  form: PostProjectFormState,
): string | null {
  if (step === 0 && !form.serviceId) {
    return "Select a service type to continue.";
  }
  if (step === 1) {
    const primary = form.locations[0];
    if (!primary?.address.trim() && !primary?.city.trim()) {
      return "Add a project address or city.";
    }
  }
  if (step === 2 && form.deliverables.length === 0) {
    return "Select at least one deliverable.";
  }
  if (step === 3) {
    if (!form.quoteType) return "Select how you would like to receive quotes.";
    if (!form.priority) return "Select a project priority.";
    if (form.coverTravelExpenses === null) {
      return "Select whether you will cover pilot travel expenses.";
    }
    if (form.quoteType === "fixed_budget") {
      if (!form.budgetMin.trim() || !form.budgetMax.trim()) {
        return "Enter minimum and maximum budget.";
      }
    }
  }
  return null;
}

export function validatePostProjectSubmit(form: PostProjectFormState): string | null {
  for (let i = 0; i < POST_PROJECT_STEPS.length - 1; i++) {
    const stepError = validatePostProjectStep(i, form);
    if (stepError) return stepError;
  }
  if (!form.termsAcknowledged) {
    return "Acknowledge the terms and conditions before submitting.";
  }
  return null;
}

export function postProjectToJobPayload(form: PostProjectFormState) {
  const service = serviceLabel(form.serviceId);
  const primary = form.locations[0] ?? emptyPostProjectLocation();
  const deliverablesLine = form.deliverables.join(", ");
  const meta = [
    form.quoteType ? `Quote type: ${form.quoteType.replace("_", " ")}` : null,
    form.priority ? `Priority: ${form.priority}` : null,
    form.completionDate
      ? `Completion target: ${formatIsoDateForDisplay(form.completionDate)}`
      : null,
    form.locations.length > 1
      ? `Additional locations: ${form.locations.length - 1}`
      : null,
    form.coverTravelExpenses === true ? "Client covers pilot travel expenses." : null,
    form.coverTravelExpenses === false ? "Pilot travel expenses not covered by client." : null,
  ]
    .filter(Boolean)
    .join("\n");

  const descriptionParts = [
    `Client posted a ${service} mission via the project wizard.`,
    deliverablesLine ? `Deliverables requested: ${deliverablesLine}.` : null,
    form.specialRequirements.trim() || null,
    meta || null,
  ].filter(Boolean);

  const requirementsParts = [
    deliverablesLine ? `Deliverables: ${deliverablesLine}` : null,
    form.specialRequirements.trim() || null,
  ].filter(Boolean);

  const postProject = extractPostProjectMetadata(form);

  return {
    title: `${service} mission`,
    description: descriptionParts.join(" ").slice(0, 2000),
    category: serviceCategory(form.serviceId),
    locationLabel: primary.address.trim() || primary.city.trim() || "Project site",
    locationCity: primary.city.trim() || null,
    locationRegion: primary.state.trim() || null,
    locationCountry: primary.country.trim() || null,
    scheduledDate: form.deadline.trim() || form.completionDate.trim() || null,
    budgetMin: form.budgetMin.trim() ? Number(form.budgetMin) : null,
    budgetMax: form.budgetMax.trim() ? Number(form.budgetMax) : null,
    requirements: requirementsParts.join("\n") || null,
    currency: "USD",
    postProject,
  };
}

export type PostProjectJobPayload = ReturnType<typeof postProjectToJobPayload>;
export type { JobPostProjectMetadata };
