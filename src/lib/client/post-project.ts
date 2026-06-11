import type { JobCategoryId } from "@/types/job";

export const POST_PROJECT_STEPS = [
  { id: "service", label: "Service" },
  { id: "location", label: "Location" },
  { id: "requirements", label: "Requirements" },
  { id: "budget", label: "Budget & Timeline" },
  { id: "review", label: "Review" },
] as const;

export type PostProjectStepId = (typeof POST_PROJECT_STEPS)[number]["id"];

export const POST_PROJECT_SERVICES = [
  { id: "aerial_photography", label: "Aerial Photography", category: "aerial_video" },
  { id: "aerial_videography", label: "Aerial Videography", category: "aerial_video" },
  { id: "real_estate_photography", label: "Real Estate Photography", category: "real_estate" },
  { id: "land_survey_mapping", label: "Land Survey & Mapping", category: "surveying" },
  { id: "construction_inspection", label: "Construction Inspection", category: "inspection" },
  { id: "roof_inspection", label: "Roof Inspection", category: "inspection" },
  { id: "event_coverage", label: "Event Coverage", category: "events" },
  { id: "thermal_imaging", label: "Thermal Imaging", category: "inspection" },
  { id: "agricultural_survey", label: "Agricultural Survey", category: "agriculture" },
  { id: "other", label: "Other", category: "other" },
] as const;

export type PostProjectServiceId = (typeof POST_PROJECT_SERVICES)[number]["id"];

export const POST_PROJECT_DELIVERABLES = [
  "Photos",
  "Video",
  "Edited Video",
  "Inspection Report",
  "Survey Data",
  "3D Model",
  "Thermal Images",
] as const;

export type PostProjectDeliverable = (typeof POST_PROJECT_DELIVERABLES)[number];

export const POST_PROJECT_QUOTE_TYPES = [
  {
    id: "fixed_budget",
    label: "Fixed Budget",
    helper: "Pilots respond if it fits your range",
  },
  {
    id: "pilot_quotes",
    label: "Receive Pilot Quotes",
    helper: "Each pilot sets their own price",
  },
] as const;

export type PostProjectQuoteType = (typeof POST_PROJECT_QUOTE_TYPES)[number]["id"];

export const POST_PROJECT_PRIORITIES = [
  { id: "standard", label: "Standard", helper: "Within 2 weeks" },
  { id: "urgent", label: "Urgent", helper: "Within 3 days" },
  { id: "emergency", label: "Emergency", helper: "Within 24 hours" },
] as const;

export type PostProjectPriority = (typeof POST_PROJECT_PRIORITIES)[number]["id"];

export type PostProjectLocation = {
  address: string;
  city: string;
  stateCountry: string;
};

export type PostProjectFormState = {
  serviceId: PostProjectServiceId | "";
  locations: PostProjectLocation[];
  deliverables: PostProjectDeliverable[];
  completionDate: string;
  referenceFileNames: string[];
  specialRequirements: string;
  quoteType: PostProjectQuoteType | "";
  budgetMin: string;
  budgetMax: string;
  priority: PostProjectPriority | "";
  deadline: string;
};

export const emptyPostProjectLocation = (): PostProjectLocation => ({
  address: "",
  city: "",
  stateCountry: "",
});

export const initialPostProjectFormState = (): PostProjectFormState => ({
  serviceId: "",
  locations: [emptyPostProjectLocation()],
  deliverables: [],
  completionDate: "",
  referenceFileNames: [],
  specialRequirements: "",
  quoteType: "",
  budgetMin: "",
  budgetMax: "",
  priority: "",
  deadline: "",
});

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
  const parts = [primary.city, primary.stateCountry].filter((p) => p.trim());
  if (parts.length) return parts.join(", ");
  if (primary.address.trim()) return primary.address;
  return "—";
}

export function formatPostProjectBudget(form: PostProjectFormState): string {
  const min = form.budgetMin.trim();
  const max = form.budgetMax.trim();
  if (min && max) {
    const minNum = Number(min).toLocaleString();
    const maxNum = Number(max).toLocaleString();
    return `$${minNum} - $${maxNum}`;
  }
  if (form.quoteType === "pilot_quotes") return "Pilot quotes";
  return "—";
}

export function formatPostProjectDeadline(form: PostProjectFormState): string {
  if (form.deadline.trim()) return form.deadline;
  if (form.completionDate.trim()) return form.completionDate;
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
    if (form.quoteType === "fixed_budget") {
      if (!form.budgetMin.trim() || !form.budgetMax.trim()) {
        return "Enter minimum and maximum budget.";
      }
    }
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
    form.completionDate ? `Completion target: ${form.completionDate}` : null,
    form.locations.length > 1
      ? `Additional locations: ${form.locations.length - 1}`
      : null,
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
    meta || null,
  ].filter(Boolean);

  return {
    title: `${service} mission`,
    description: descriptionParts.join(" ").slice(0, 2000),
    category: serviceCategory(form.serviceId),
    locationLabel: primary.address.trim() || primary.city.trim() || "Project site",
    locationCity: primary.city.trim() || null,
    locationRegion: null,
    locationCountry: primary.stateCountry.trim() || null,
    scheduledDate: form.deadline.trim() || form.completionDate.trim() || null,
    budgetMin: form.budgetMin.trim() ? Number(form.budgetMin) : null,
    budgetMax: form.budgetMax.trim() ? Number(form.budgetMax) : null,
    requirements: requirementsParts.join("\n") || null,
    currency: "USD",
  };
}
