"use client";

import { ComplianceChecklist } from "@/components/pilot/ComplianceChecklist";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { PILOT_SERVICE_OPTIONS } from "@/types/pilot";
import { cn } from "@/lib/utils";

export type PilotFormState = {
  displayName: string;
  bio: string;
  locationCity: string;
  locationRegion: string;
  locationCountry: string;
  serviceRadiusKm: string;
  servicesOffered: string[];
  hourlyRateMin: string;
  hourlyRateMax: string;
  licenseNumber: string;
  licenseCountry: string;
  complianceAcknowledged: string[];
  isPublic: boolean;
};

export const emptyPilotFormState: PilotFormState = {
  displayName: "",
  bio: "",
  locationCity: "",
  locationRegion: "",
  locationCountry: "",
  serviceRadiusKm: "",
  servicesOffered: [],
  hourlyRateMin: "",
  hourlyRateMax: "",
  licenseNumber: "",
  licenseCountry: "",
  complianceAcknowledged: [],
  isPublic: false,
};

export type PilotFormSection = "basics" | "location" | "services" | "license" | "compliance" | "public";

type PilotProfileFormFieldsProps = {
  form: PilotFormState;
  onChange: (patch: Partial<PilotFormState>) => void;
  showCompliance?: boolean;
  showPublicToggle?: boolean;
  disabled?: boolean;
  /** When set, only render this section (multi-step onboarding). */
  section?: PilotFormSection;
};

function showSection(
  section: PilotFormSection | undefined,
  target: PilotFormSection,
) {
  return !section || section === target;
}

export function PilotProfileFormFields({
  form,
  onChange,
  showCompliance = false,
  showPublicToggle = false,
  disabled,
  section,
}: PilotProfileFormFieldsProps) {
  function toggleService(id: string) {
    if (disabled) return;
    const next = form.servicesOffered.includes(id)
      ? form.servicesOffered.filter((s) => s !== id)
      : [...form.servicesOffered, id];
    onChange({ servicesOffered: next });
  }

  return (
    <div className="space-y-8">
      {showSection(section, "basics") ? (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gold-light">Basic information</h2>
        <FormField label="Full name" htmlFor="displayName" required>
          <input
            id="displayName"
            className={inputClassName}
            value={form.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            disabled={disabled}
            required
          />
        </FormField>
        <FormField
          label="Bio"
          htmlFor="bio"
          hint="Experience, drone models, flight hours, and equipment — visible on your public profile."
        >
          <textarea
            id="bio"
            rows={3}
            className={inputClassName}
            value={form.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            disabled={disabled}
          />
        </FormField>
      </section>
      ) : null}

      {showSection(section, "location") ? (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gold-light">Location & service area</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="City" htmlFor="locationCity" required>
            <input
              id="locationCity"
              className={inputClassName}
              value={form.locationCity}
              onChange={(e) => onChange({ locationCity: e.target.value })}
              disabled={disabled}
            />
          </FormField>
          <FormField label="State / region" htmlFor="locationRegion">
            <input
              id="locationRegion"
              className={inputClassName}
              value={form.locationRegion}
              onChange={(e) => onChange({ locationRegion: e.target.value })}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Country" htmlFor="locationCountry" required>
            <input
              id="locationCountry"
              className={inputClassName}
              value={form.locationCountry}
              onChange={(e) => onChange({ locationCountry: e.target.value })}
              disabled={disabled}
            />
          </FormField>
          <FormField
            label="Service radius (km)"
            htmlFor="serviceRadiusKm"
            hint="How far you will travel for jobs."
          >
            <input
              id="serviceRadiusKm"
              type="number"
              min={0}
              className={inputClassName}
              value={form.serviceRadiusKm}
              onChange={(e) => onChange({ serviceRadiusKm: e.target.value })}
              disabled={disabled}
            />
          </FormField>
        </div>
      </section>
      ) : null}

      {showSection(section, "services") ? (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gold-light">Services & equipment</h2>
        <p className="text-sm text-muted-foreground">
          Select services you offer and your typical rate range. Add drone models and flight
          hours in your bio if helpful for clients.
        </p>
        <fieldset>
          <legend className="text-sm font-medium">
            Services offered <span className="text-destructive">*</span>
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PILOT_SERVICE_OPTIONS.map((service) => {
              const selected = form.servicesOffered.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleService(service.id)}
                  className={cn(
                    "chip-select",
                    selected && "chip-select-active",
                    disabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  {service.label}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Hourly rate min ($)" htmlFor="hourlyRateMin">
            <input
              id="hourlyRateMin"
              type="number"
              min={0}
              step="1"
              className={inputClassName}
              value={form.hourlyRateMin}
              onChange={(e) => onChange({ hourlyRateMin: e.target.value })}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Hourly rate max ($)" htmlFor="hourlyRateMax">
            <input
              id="hourlyRateMax"
              type="number"
              min={0}
              step="1"
              className={inputClassName}
              value={form.hourlyRateMax}
              onChange={(e) => onChange({ hourlyRateMax: e.target.value })}
              disabled={disabled}
            />
          </FormField>
        </div>
      </section>
      ) : null}

      {showSection(section, "license") ? (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gold-light">FAA certificate / license</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="License / certificate number"
            htmlFor="licenseNumber"
            required
          >
            <input
              id="licenseNumber"
              className={inputClassName}
              value={form.licenseNumber}
              onChange={(e) => onChange({ licenseNumber: e.target.value })}
              disabled={disabled}
            />
          </FormField>
          <FormField label="Issuing country" htmlFor="licenseCountry">
            <input
              id="licenseCountry"
              className={inputClassName}
              value={form.licenseCountry}
              onChange={(e) => onChange({ licenseCountry: e.target.value })}
              disabled={disabled}
            />
          </FormField>
        </div>
      </section>
      ) : null}

      {showPublicToggle && showSection(section, "public") ? (
        <section className="premium-card p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border"
              checked={form.isPublic}
              onChange={(e) => onChange({ isPublic: e.target.checked })}
              disabled={disabled}
            />
            <span>
              <span className="text-sm font-medium">Public profile</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                List your profile in the public pilot directory. Only available
                while your account is approved.
              </span>
            </span>
          </label>
        </section>
      ) : null}

      {showCompliance && showSection(section, "compliance") ? (
        <section>
          <ComplianceChecklist
            value={form.complianceAcknowledged}
            onChange={(complianceAcknowledged) =>
              onChange({ complianceAcknowledged })
            }
            disabled={disabled}
          />
        </section>
      ) : null}
    </div>
  );
}

export function pilotFormToPayload(
  form: PilotFormState,
  completeOnboarding: boolean,
) {
  return {
    displayName: form.displayName,
    bio: form.bio || null,
    locationCity: form.locationCity,
    locationRegion: form.locationRegion || null,
    locationCountry: form.locationCountry,
    serviceRadiusKm: form.serviceRadiusKm
      ? Number(form.serviceRadiusKm)
      : null,
    servicesOffered: form.servicesOffered,
    hourlyRateMin: form.hourlyRateMin ? Number(form.hourlyRateMin) : null,
    hourlyRateMax: form.hourlyRateMax ? Number(form.hourlyRateMax) : null,
    licenseNumber: form.licenseNumber,
    licenseCountry: form.licenseCountry || null,
    isPublic: form.isPublic,
    complianceAcknowledged: form.complianceAcknowledged,
    completeOnboarding,
  };
}

export function pilotDtoToFormState(
  profile: import("@/types/pilot").PilotProfileDto,
): PilotFormState {
  return {
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    locationCity: profile.locationCity ?? "",
    locationRegion: profile.locationRegion ?? "",
    locationCountry: profile.locationCountry ?? "",
    serviceRadiusKm: profile.serviceRadiusKm?.toString() ?? "",
    servicesOffered: profile.servicesOffered,
    hourlyRateMin: profile.hourlyRateMin?.toString() ?? "",
    hourlyRateMax: profile.hourlyRateMax?.toString() ?? "",
    licenseNumber: profile.licenseNumber,
    licenseCountry: profile.licenseCountry ?? "",
    complianceAcknowledged: profile.complianceAcceptedAt
      ? ["valid_license", "insurance", "airspace_rules", "accurate_info"]
      : [],
    isPublic: profile.isPublic,
  };
}
