import type { JobCategoryId } from "@/types/job";

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
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  category: JobCategoryId;
}>;

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
    label: "Receive Pilot Proposals",
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
  country: string;
  state: string;
};

export type PostProjectTravelExpenses = {
  airTravel: string;
  lodging: string;
  incidentals: string;
  groundTransport: string;
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
  coverTravelExpenses: boolean | null;
  travelExpenses: PostProjectTravelExpenses;
  termsAcknowledged: boolean;
};

export const POST_PROJECT_OFF_PLATFORM_ACK_BEFORE =
  "I acknowledge that conducting off-platform billing, client-pilot direct billing, is a violation of the ";

export const POST_PROJECT_OFF_PLATFORM_ACK_LINK = "terms and conditions";

export const POST_PROJECT_OFF_PLATFORM_ACK_AFTER =
  ", and will result in permanent removal and restricting of both individuals and companies from platform use";

/** Full acknowledgment sentence for tests and plain-text use. */
export const POST_PROJECT_OFF_PLATFORM_ACKNOWLEDGMENT =
  `${POST_PROJECT_OFF_PLATFORM_ACK_BEFORE}${POST_PROJECT_OFF_PLATFORM_ACK_LINK}${POST_PROJECT_OFF_PLATFORM_ACK_AFTER}`;

export const emptyPostProjectTravelExpenses = (): PostProjectTravelExpenses => ({
  airTravel: "",
  lodging: "",
  incidentals: "",
  groundTransport: "",
});

export const emptyPostProjectLocation = (): PostProjectLocation => ({
  address: "",
  city: "",
  country: "",
  state: "",
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
  coverTravelExpenses: null,
  travelExpenses: emptyPostProjectTravelExpenses(),
  termsAcknowledged: false,
});

export function postProjectServiceLabel(serviceId: PostProjectServiceId | string): string {
  return (
    POST_PROJECT_SERVICES.find((service) => service.id === serviceId)?.label ??
    serviceId
  );
}

export function postProjectQuoteTypeLabel(
  quoteType: PostProjectQuoteType | string,
): string {
  return (
    POST_PROJECT_QUOTE_TYPES.find((option) => option.id === quoteType)?.label ??
    quoteType
  );
}

export function postProjectPriorityLabel(
  priority: PostProjectPriority | string,
): string {
  return (
    POST_PROJECT_PRIORITIES.find((option) => option.id === priority)?.label ??
    priority
  );
}
