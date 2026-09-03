import {
  validateComplianceAcknowledgments,
  type ComplianceItemId,
} from "@/lib/pilot/compliance";
import {
  isAvatarPayloadTooLarge,
  sanitizeProfileExtrasInput,
  type PilotProfileExtras,
} from "@/lib/pilot/profile-extras";
import { PILOT_SERVICE_OPTIONS, type PilotServiceId } from "@/types/pilot";

const VALID_SERVICE_IDS = new Set(
  PILOT_SERVICE_OPTIONS.map((s) => s.id),
);

export type PilotProfileInput = {
  displayName?: string;
  bio?: string | null;
  locationCity?: string | null;
  locationRegion?: string | null;
  locationCountry?: string | null;
  serviceRadiusKm?: number | null;
  servicesOffered?: string[];
  hourlyRateMin?: number | null;
  hourlyRateMax?: number | null;
  licenseNumber?: string;
  licenseCountry?: string | null;
  complianceAcknowledged?: string[];
  completeOnboarding?: boolean;
  isPublic?: boolean;
  extras?: PilotProfileExtras;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function validatePilotProfileInput(
  input: PilotProfileInput,
  options: { requireAllForOnboarding: boolean },
): ValidationResult<PilotProfileInput> {
  const displayName = input.displayName?.trim() ?? "";
  const licenseNumber = input.licenseNumber?.trim() ?? "";

  if (options.requireAllForOnboarding) {
    if (displayName.length < 2) {
      return { ok: false, error: "Display name is required (at least 2 characters)." };
    }
    // License credentials come from Verifications uploads; keep a DB placeholder when empty.
    const city = input.locationCity?.trim();
    const country = input.locationCountry?.trim();
    if (!city || !country) {
      return {
        ok: false,
        error: "City and country are required for your service location.",
      };
    }
    const services = input.servicesOffered ?? [];
    if (services.length === 0) {
      return { ok: false, error: "Select at least one service you offer." };
    }
    const ack = input.complianceAcknowledged ?? [];
    if (!validateComplianceAcknowledgments(ack)) {
      return {
        ok: false,
        error: "You must accept all compliance checklist items to continue.",
      };
    }
  }

  const resolvedLicenseNumber =
    licenseNumber ||
    (options.requireAllForOnboarding ? "Pending verification documents" : licenseNumber);

  const services = (input.servicesOffered ?? []).filter((s): s is PilotServiceId =>
    VALID_SERVICE_IDS.has(s as PilotServiceId),
  );

  const min = input.hourlyRateMin;
  const max = input.hourlyRateMax;
  if (min != null && max != null && min > max) {
    return { ok: false, error: "Minimum rate cannot exceed maximum rate." };
  }

  if (input.serviceRadiusKm != null && input.serviceRadiusKm < 0) {
    return { ok: false, error: "Service radius must be zero or greater." };
  }

  const extras = input.extras
    ? sanitizeProfileExtrasInput(input.extras)
    : undefined;
  if (extras && isAvatarPayloadTooLarge(extras.avatarUrl)) {
    return { ok: false, error: "Profile photo is too large. Use a smaller image." };
  }

  return {
    ok: true,
    data: {
      ...input,
      displayName,
      licenseNumber: resolvedLicenseNumber,
      servicesOffered: services,
      extras,
      complianceAcknowledged: input.complianceAcknowledged as
        | ComplianceItemId[]
        | undefined,
    },
  };
}
