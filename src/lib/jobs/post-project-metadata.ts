import type {
  PostProjectDeliverable,
  PostProjectFormState,
  PostProjectLocation,
  PostProjectPriority,
  PostProjectQuoteType,
  PostProjectServiceId,
} from "@/lib/client/post-project-constants";
import {
  POST_PROJECT_DELIVERABLES,
  POST_PROJECT_PRIORITIES,
  POST_PROJECT_QUOTE_TYPES,
  POST_PROJECT_SERVICES,
} from "@/lib/client/post-project-constants";

export type JobPostProjectTravelMetadata = {
  coverTravelExpenses: boolean;
  airTravel: number | null;
  lodging: number | null;
  incidentals: number | null;
  groundTransport: number | null;
};

export type JobPostProjectMetadata = {
  serviceId: PostProjectServiceId;
  locations: PostProjectLocation[];
  deliverables: PostProjectDeliverable[];
  quoteType: PostProjectQuoteType;
  priority: PostProjectPriority;
  completionDate: string | null;
  deadline: string | null;
  referenceFileNames: string[];
  referenceFileUrls: string[];
  specialRequirements: string | null;
  travel: JobPostProjectTravelMetadata | null;
};

const VALID_SERVICE_IDS = new Set(
  POST_PROJECT_SERVICES.map((service) => service.id),
);
const VALID_DELIVERABLES = new Set<string>(POST_PROJECT_DELIVERABLES);
const VALID_QUOTE_TYPES = new Set<string>(
  POST_PROJECT_QUOTE_TYPES.map((option) => option.id),
);
const VALID_PRIORITIES = new Set<string>(
  POST_PROJECT_PRIORITIES.map((option) => option.id),
);

function normalizeLocation(value: unknown): PostProjectLocation | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const legacyStateCountry =
    typeof record.stateCountry === "string" ? record.stateCountry : "";
  return {
    address: typeof record.address === "string" ? record.address : "",
    city: typeof record.city === "string" ? record.city : "",
    country:
      typeof record.country === "string" ? record.country : legacyStateCountry,
    state: typeof record.state === "string" ? record.state : "",
  };
}

function parseTravelAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeTravel(value: unknown): JobPostProjectTravelMetadata | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.coverTravelExpenses !== "boolean") return null;
  return {
    coverTravelExpenses: record.coverTravelExpenses,
    airTravel: parseTravelAmount(record.airTravel),
    lodging: parseTravelAmount(record.lodging),
    incidentals: parseTravelAmount(record.incidentals),
    groundTransport: parseTravelAmount(record.groundTransport),
  };
}

function extractTravelMetadata(
  form: PostProjectFormState,
): JobPostProjectTravelMetadata | null {
  if (form.coverTravelExpenses === null) return null;

  const expenses = form.travelExpenses;
  return {
    coverTravelExpenses: form.coverTravelExpenses,
    airTravel: parseTravelAmount(expenses.airTravel),
    lodging: parseTravelAmount(expenses.lodging),
    incidentals: parseTravelAmount(expenses.incidentals),
    groundTransport: parseTravelAmount(expenses.groundTransport),
  };
}

export function extractPostProjectMetadata(
  form: PostProjectFormState,
): JobPostProjectMetadata {
  return {
    serviceId: form.serviceId as PostProjectServiceId,
    locations: form.locations.map((location) => ({ ...location })),
    deliverables: [...form.deliverables],
    quoteType: form.quoteType as PostProjectQuoteType,
    priority: form.priority as PostProjectPriority,
    completionDate: form.completionDate.trim() || null,
    deadline: form.deadline.trim() || null,
    referenceFileNames: [...form.referenceFileNames],
    referenceFileUrls: [...(form.referenceFileUrls ?? [])],
    specialRequirements: form.specialRequirements.trim() || null,
    travel: extractTravelMetadata(form),
  };
}

export function parseJobPostProjectMetadata(
  json: string | null | undefined,
): JobPostProjectMetadata | null {
  if (!json?.trim()) return null;

  try {
    const parsed = JSON.parse(json) as Partial<JobPostProjectMetadata>;
    if (!parsed.serviceId || !VALID_SERVICE_IDS.has(parsed.serviceId)) {
      return null;
    }
    if (!parsed.quoteType || !VALID_QUOTE_TYPES.has(parsed.quoteType)) {
      return null;
    }
    if (!parsed.priority || !VALID_PRIORITIES.has(parsed.priority)) {
      return null;
    }

    const locations = Array.isArray(parsed.locations)
      ? parsed.locations
          .map(normalizeLocation)
          .filter((location): location is PostProjectLocation => location != null)
      : [];

    const deliverables = Array.isArray(parsed.deliverables)
      ? parsed.deliverables.filter(
          (item): item is PostProjectDeliverable =>
            typeof item === "string" && VALID_DELIVERABLES.has(item),
        )
      : [];

    return {
      serviceId: parsed.serviceId,
      locations,
      deliverables,
      quoteType: parsed.quoteType as PostProjectQuoteType,
      priority: parsed.priority as PostProjectPriority,
      completionDate:
        typeof parsed.completionDate === "string" ? parsed.completionDate : null,
      deadline: typeof parsed.deadline === "string" ? parsed.deadline : null,
      referenceFileNames: Array.isArray(parsed.referenceFileNames)
        ? parsed.referenceFileNames.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      referenceFileUrls: Array.isArray(parsed.referenceFileUrls)
        ? parsed.referenceFileUrls.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      specialRequirements:
        typeof parsed.specialRequirements === "string"
          ? parsed.specialRequirements
          : null,
      travel: normalizeTravel(parsed.travel),
    };
  } catch {
    return null;
  }
}

export function serializeJobPostProjectMetadata(
  metadata: JobPostProjectMetadata | null | undefined,
): string | null {
  if (!metadata) return null;
  return JSON.stringify(metadata);
}
