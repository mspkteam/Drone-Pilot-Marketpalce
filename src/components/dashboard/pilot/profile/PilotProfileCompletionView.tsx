"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ProfileStrengthPanel } from "@/components/dashboard/shared/profile/ProfileStrengthPanel";
import { ComplianceChecklist } from "@/components/pilot/ComplianceChecklist";
import {
  emptyPilotFormState,
  pilotDtoToFormState,
  pilotFormToPayload,
  type PilotFormState,
} from "@/components/pilot/PilotProfileFormFields";
import { computePilotProfileStrength } from "@/lib/pilot/pilot-profile-strength";
import {
  isChipSelected,
  PILOT_PROFILE_SERVICE_CHIPS,
  toggleServiceChip,
} from "@/lib/pilot/pilot-profile-service-chips";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import { isPublicPilotProfileEnabled } from "@/lib/public-access";
import type { PilotProfileDto } from "@/types/pilot";

type PilotProfileCompletionViewProps = {
  profile: PilotProfileDto | null;
  insuranceVerified?: boolean;
};

type PilotUiExtras = {
  callSign: string;
  droneEquipment: string;
  languages: string;
  locationCombined: string;
  serviceRadiusMi: string;
  hourlyRateDisplay: string;
  localChipIds: string[];
  portfolioSlots: (string | null)[];
  avatarPreview: string | null;
};

function formatLocation(city: string, region: string): string {
  return [city, region].filter((p) => p.trim()).join(", ");
}

function parseLocation(value: string): { city: string; region: string } {
  const parts = value.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    return { city: parts[0] ?? "", region: parts.slice(1).join(", ") };
  }
  return { city: value.trim(), region: "" };
}

function kmToMi(km: string): string {
  const n = Number(km);
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.round(n / 1.60934));
}

function miToKm(mi: string): string {
  const n = Number(mi);
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(Math.round(n * 1.60934));
}

function buildExtras(profile: PilotProfileDto | null): PilotUiExtras {
  const form = profile ? pilotDtoToFormState(profile) : emptyPilotFormState;
  return {
    callSign: "",
    droneEquipment: "",
    languages: "",
    locationCombined: formatLocation(form.locationCity, form.locationRegion),
    serviceRadiusMi: kmToMi(form.serviceRadiusKm),
    hourlyRateDisplay: form.hourlyRateMin || form.hourlyRateMax || "",
    localChipIds: [],
    portfolioSlots: [null, null, null, null],
    avatarPreview: null,
  };
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="13" r="3.25" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M7 1.5c-1.75 0-3.25 1.5-3.25 3.25 0 2.4 3.25 6.4 3.25 6.4s3.25-4 3.25-6.4C10.25 3 8.75 1.5 7 1.5z" />
      <circle cx="7" cy="4.75" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M7 1.5v11M4.5 3.5h4a2 2 0 0 1 0 4h-3a2 2 0 0 0 0 4h4.5" strokeLinecap="round" />
    </svg>
  );
}

function DroneIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="21" cy="7" r="2.5" />
      <circle cx="7" cy="21" r="2.5" />
      <circle cx="21" cy="21" r="2.5" />
      <rect x="10.5" y="12.5" width="7" height="3" rx="0.75" />
      <path d="M9.5 7h9M9.5 21h9M7 9.5v9M21 9.5v9" strokeLinecap="round" />
    </svg>
  );
}

export function PilotProfileCompletionView({
  profile,
  insuranceVerified = false,
}: PilotProfileCompletionViewProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [portfolioIndex, setPortfolioIndex] = useState<number | null>(null);

  const [form, setForm] = useState<PilotFormState>(() =>
    profile ? pilotDtoToFormState(profile) : emptyPilotFormState,
  );
  const [extras, setExtras] = useState<PilotUiExtras>(() => buildExtras(profile));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canEdit = !profile || profile.status !== "suspended";
  const needsOnboarding = !profile?.onboardingCompletedAt;
  const showCompliance = needsOnboarding;

  const strength = useMemo(
    () =>
      computePilotProfileStrength({
        form,
        avatarPreview: extras.avatarPreview,
        portfolioCount: extras.portfolioSlots.filter(Boolean).length,
        insuranceVerified,
      }),
    [form, extras.avatarPreview, extras.portfolioSlots, insuranceVerified],
  );

  const previewHref =
    isPublicPilotProfileEnabled() &&
    profile?.status === "approved" &&
    profile.isPublic
      ? `/pilots/${profile.id}`
      : null;

  function patchForm(patch: Partial<PilotFormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function patchExtras(patch: Partial<PilotUiExtras>) {
    setExtras((e) => ({ ...e, ...patch }));
  }

  function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    patchExtras({ avatarPreview: url });
  }

  function handlePortfolioChange(file: File | undefined) {
    if (!file || portfolioIndex === null) return;
    const url = URL.createObjectURL(file);
    setExtras((e) => {
      const next = [...e.portfolioSlots];
      next[portfolioIndex] = url;
      return { ...e, portfolioSlots: next };
    });
    setPortfolioIndex(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const loc = parseLocation(extras.locationCombined);
    const mergedForm: PilotFormState = {
      ...form,
      locationCity: loc.city,
      locationRegion: loc.region,
      serviceRadiusKm: miToKm(extras.serviceRadiusMi),
      hourlyRateMin: extras.hourlyRateDisplay,
      hourlyRateMax: extras.hourlyRateDisplay || form.hourlyRateMax,
    };

    const payload = pilotFormToPayload(mergedForm, needsOnboarding);
    const method = profile ? "PATCH" : "POST";
    const res = await fetch("/api/pilot/profile", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save profile.");
      return;
    }

    setForm(mergedForm);
    setSuccess(
      needsOnboarding
        ? "Profile submitted for review."
        : "Profile saved successfully.",
    );
    router.refresh();
  }

  return (
    <form className="profile-onboarding-page" onSubmit={(e) => void handleSave(e)}>
      {profile ? (
        <p className="text-sm text-ras-muted">
          Status:{" "}
          <span className="font-semibold text-gold">
            {getProfileStatusLabel(profile.status)}
          </span>
        </p>
      ) : null}

      {error ? (
        <p className="profile-onboarding-banner profile-onboarding-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="profile-onboarding-banner" role="status">
          {success}
        </p>
      ) : null}

      <div className="profile-onboarding-layout">
        <div className="profile-onboarding-main">
          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">IDENTITY</h2>
            <div className="profile-onboarding-identity-grid">
              <button
                type="button"
                className="profile-onboarding-avatar-btn"
                onClick={() => avatarInputRef.current?.click()}
                disabled={!canEdit || loading}
              >
                {extras.avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={extras.avatarPreview} alt="" />
                ) : (
                  <>
                    <CameraIcon />
                    <span className="profile-onboarding-avatar-label">UPLOAD</span>
                  </>
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="profile-onboarding-hidden-input"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />

              <div className="profile-onboarding-fields profile-onboarding-fields--2">
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="displayName">
                    DISPLAY NAME
                  </label>
                  <input
                    id="displayName"
                    className="profile-onboarding-input"
                    value={form.displayName}
                    onChange={(e) => patchForm({ displayName: e.target.value })}
                    disabled={!canEdit || loading}
                    required
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="callSign">
                    CALL SIGN
                  </label>
                  <input
                    id="callSign"
                    className="profile-onboarding-input"
                    value={extras.callSign}
                    onChange={(e) => patchExtras({ callSign: e.target.value })}
                    disabled={!canEdit || loading}
                    placeholder="CDR. STERLING"
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="location">
                    LOCATION
                  </label>
                  <div className="profile-onboarding-input-wrap">
                    <span className="profile-onboarding-input-icon">
                      <PinIcon />
                    </span>
                    <input
                      id="location"
                      className="profile-onboarding-input"
                      value={extras.locationCombined}
                      onChange={(e) => patchExtras({ locationCombined: e.target.value })}
                      disabled={!canEdit || loading}
                      placeholder="Seattle, WA"
                    />
                  </div>
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="serviceRadius">
                    SERVICE RADIUS
                  </label>
                  <input
                    id="serviceRadius"
                    className="profile-onboarding-input"
                    value={extras.serviceRadiusMi}
                    onChange={(e) => patchExtras({ serviceRadiusMi: e.target.value })}
                    disabled={!canEdit || loading}
                    placeholder="120 mi"
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="locationCountry">
                    COUNTRY
                  </label>
                  <input
                    id="locationCountry"
                    className="profile-onboarding-input"
                    value={form.locationCountry}
                    onChange={(e) => patchForm({ locationCountry: e.target.value })}
                    disabled={!canEdit || loading}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">BIO &amp; BIO SPECS</h2>
            <div className="profile-onboarding-field">
              <textarea
                className="profile-onboarding-textarea"
                value={form.bio}
                onChange={(e) => patchForm({ bio: e.target.value })}
                disabled={!canEdit || loading}
                placeholder="Senior remote pilot with operational experience..."
              />
            </div>
            <div className="profile-onboarding-fields profile-onboarding-fields--3" style={{ marginTop: "1rem" }}>
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="hourlyRate">
                  HOURLY RATE
                </label>
                <div className="profile-onboarding-input-wrap">
                  <span className="profile-onboarding-input-icon">
                    <DollarIcon />
                  </span>
                  <input
                    id="hourlyRate"
                    className="profile-onboarding-input"
                    value={extras.hourlyRateDisplay}
                    onChange={(e) => patchExtras({ hourlyRateDisplay: e.target.value })}
                    disabled={!canEdit || loading}
                    placeholder="185"
                  />
                </div>
              </div>
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="droneEquipment">
                  DRONE EQUIPMENT
                </label>
                <input
                  id="droneEquipment"
                  className="profile-onboarding-input"
                  value={extras.droneEquipment}
                  onChange={(e) => patchExtras({ droneEquipment: e.target.value })}
                  disabled={!canEdit || loading}
                  placeholder="DJI Matrice 350 RTK"
                />
              </div>
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="languages">
                  LANGUAGES
                </label>
                <input
                  id="languages"
                  className="profile-onboarding-input"
                  value={extras.languages}
                  onChange={(e) => patchExtras({ languages: e.target.value })}
                  disabled={!canEdit || loading}
                  placeholder="English, German"
                />
              </div>
            </div>
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">SERVICE CATEGORIES</h2>
            <div className="profile-onboarding-chips">
              {PILOT_PROFILE_SERVICE_CHIPS.map((chip) => {
                const selected = isChipSelected(
                  chip,
                  form.servicesOffered,
                  extras.localChipIds,
                );
                return (
                  <button
                    key={chip.id}
                    type="button"
                    className={`profile-onboarding-chip${selected ? " profile-onboarding-chip--active" : ""}`}
                    disabled={!canEdit || loading}
                    onClick={() => {
                      const next = toggleServiceChip(
                        chip,
                        form.servicesOffered,
                        extras.localChipIds,
                      );
                      patchForm({ servicesOffered: next.servicesOffered });
                      patchExtras({ localChipIds: next.localChipIds });
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">PORTFOLIO</h2>
            <div className="profile-onboarding-portfolio-grid">
              {extras.portfolioSlots.map((slot, index) => (
                <button
                  key={`portfolio-${index}`}
                  type="button"
                  className="profile-onboarding-portfolio-slot"
                  onClick={() => {
                    setPortfolioIndex(index);
                    portfolioInputRef.current?.click();
                  }}
                  disabled={!canEdit || loading}
                >
                  {slot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slot} alt="" />
                  ) : index === extras.portfolioSlots.length - 1 ? (
                    <span className="profile-onboarding-portfolio-add">+</span>
                  ) : (
                    <DroneIcon />
                  )}
                </button>
              ))}
            </div>
            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/*"
              className="profile-onboarding-hidden-input"
              onChange={(e) => handlePortfolioChange(e.target.files?.[0])}
            />
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">LICENSE &amp; COMPLIANCE</h2>
            <div className="profile-onboarding-fields profile-onboarding-fields--2">
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="licenseNumber">
                  LICENSE / CERTIFICATE
                </label>
                <input
                  id="licenseNumber"
                  className="profile-onboarding-input"
                  value={form.licenseNumber}
                  onChange={(e) => patchForm({ licenseNumber: e.target.value })}
                  disabled={!canEdit || loading}
                  required
                />
              </div>
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="licenseCountry">
                  ISSUING COUNTRY
                </label>
                <input
                  id="licenseCountry"
                  className="profile-onboarding-input"
                  value={form.licenseCountry}
                  onChange={(e) => patchForm({ licenseCountry: e.target.value })}
                  disabled={!canEdit || loading}
                />
              </div>
            </div>
            {showCompliance ? (
              <div style={{ marginTop: "1rem" }}>
                <ComplianceChecklist
                  value={form.complianceAcknowledged}
                  onChange={(complianceAcknowledged) =>
                    patchForm({ complianceAcknowledged })
                  }
                  disabled={!canEdit || loading}
                />
              </div>
            ) : null}
            {profile?.status === "approved" ? (
              <label className="mt-4 flex items-start gap-2 text-sm text-ras-muted">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => patchForm({ isPublic: e.target.checked })}
                  disabled={!canEdit || loading}
                  className="mt-1"
                />
                <span>List my profile in the public pilot directory</span>
              </label>
            ) : null}
          </section>
        </div>

        <ProfileStrengthPanel
          title="PROFILE STRENGTH"
          pct={strength.pct}
          subtitle="PROFILE COMPLETE"
          items={strength.items}
        />
      </div>

      <div className="profile-onboarding-actions">
        {previewHref ? (
          <Link href={previewHref} className="profile-onboarding-btn-outline">
            Preview Public Profile
          </Link>
        ) : (
          <button type="button" className="profile-onboarding-btn-outline" disabled title="Available after approval">
            Preview Public Profile
          </button>
        )}
        {canEdit ? (
          <button type="submit" className="profile-onboarding-btn-gold" disabled={loading}>
            {loading ? "Saving…" : needsOnboarding ? "Save Profile" : "Save Profile"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
