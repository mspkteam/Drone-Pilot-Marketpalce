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
  emptyPilotProfileExtras,
  type PilotProfileExtras,
} from "@/lib/pilot/profile-extras";
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
  avatarPreview: string | null;
  mainDrones: string[];
  payloads: string[];
  payloadDraft: string;
  payloadPanelOpen: boolean;
  notifications: PilotProfileExtras["notifications"];
};

const PAYLOAD_MAX = 22;
const PAYLOAD_EXAMPLES = ["LiDAR Scanner", "Thermal Imaging Camera"] as const;

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
  const extras = profile?.extras ?? emptyPilotProfileExtras();
  return {
    callSign: extras.callSign,
    droneEquipment: "",
    languages: extras.languages,
    locationCombined: formatLocation(form.locationCity, form.locationRegion),
    serviceRadiusMi: kmToMi(form.serviceRadiusKm),
    hourlyRateDisplay: form.hourlyRateMin || form.hourlyRateMax || "",
    localChipIds: extras.localChipIds,
    avatarPreview: extras.avatarUrl,
    mainDrones: extras.mainDrones,
    payloads: extras.payloads,
    payloadDraft: "",
    payloadPanelOpen: extras.payloads.length === 0,
    notifications: extras.notifications,
  };
}

function extrasPayload(extras: PilotUiExtras): PilotProfileExtras {
  const pendingDrone = extras.droneEquipment.trim();
  const pendingPayload = extras.payloadDraft.trim().slice(0, PAYLOAD_MAX);
  const mainDrones =
    pendingDrone && !extras.mainDrones.includes(pendingDrone)
      ? [...extras.mainDrones, pendingDrone]
      : extras.mainDrones;
  const payloads =
    pendingPayload && !extras.payloads.includes(pendingPayload)
      ? [...extras.payloads, pendingPayload]
      : extras.payloads;
  return {
    callSign: extras.callSign,
    languages: extras.languages,
    mainDrones,
    payloads,
    localChipIds: extras.localChipIds,
    avatarUrl: extras.avatarPreview,
    notifications: extras.notifications,
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
  const portfolioItems = profile?.portfolio ?? [];

  const strength = useMemo(
    () =>
      computePilotProfileStrength({
        form,
        avatarPreview: extras.avatarPreview,
        portfolioCount: portfolioItems.length,
        insuranceVerified,
      }),
    [form, extras.avatarPreview, portfolioItems.length, insuranceVerified],
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

  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setError(null);
    setLoading(true);
    const { uploadUserImage } = await import("@/lib/storage/upload-browser");
    const result = await uploadUserImage({ kind: "avatar", file });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    patchExtras({ avatarPreview: result.url });
  }

  function addMainDroneFromEquipment() {
    const name = extras.droneEquipment.trim();
    if (!name || extras.mainDrones.includes(name)) return;
    patchExtras({
      mainDrones: [...extras.mainDrones, name],
      droneEquipment: "",
    });
  }

  function addPayload() {
    const name = extras.payloadDraft.trim();
    if (!name || name.length > PAYLOAD_MAX || extras.payloads.includes(name)) return;
    patchExtras({
      payloads: [...extras.payloads, name],
      payloadDraft: "",
      payloadPanelOpen: false,
    });
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

    const extrasToSave = extrasPayload(extras);
    const payload = {
      ...pilotFormToPayload(mergedForm, needsOnboarding),
      extras: extrasToSave,
    };
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
    setExtras((current) => ({
      ...current,
      droneEquipment: "",
      payloadDraft: "",
      mainDrones: extrasToSave.mainDrones,
      payloads: extrasToSave.payloads,
      payloadPanelOpen: extrasToSave.payloads.length === 0,
    }));
    setSuccess(
      needsOnboarding
        ? "Profile submitted for review."
        : "Profile saved successfully.",
    );
    router.refresh();
  }

  return (
    <form className="profile-onboarding-page" onSubmit={(e) => void handleSave(e)}>
      <header className="profile-onboarding-header profile-onboarding-bracket-card">
        <p className="profile-onboarding-eyebrow">OPERATIONS / PROFILE</p>
        <h1 className="profile-onboarding-page-title">Pilot Profile</h1>
        {profile ? (
          <p className="profile-onboarding-status-line">
            Status:{" "}
            <span className="profile-onboarding-status-value">
              {getProfileStatusLabel(profile.status)}
            </span>
          </p>
        ) : null}
      </header>

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
                    maxLength={12}
                    onChange={(e) => patchExtras({ callSign: e.target.value.slice(0, 12) })}
                    disabled={!canEdit || loading}
                    placeholder="Max 12 characters"
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
                placeholder="FAA Part 107 remote pilot with operational experience..."
              />
            </div>
            <div className="profile-onboarding-fields profile-onboarding-fields--3 profile-onboarding-fields--spaced">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMainDroneFromEquipment();
                    }
                  }}
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
            <h2 className="profile-onboarding-section-title">Drones &amp; Equipment</h2>
            <p className="profile-onboarding-section-copy">
              Manage drones and payload equipment in your immediate inventory.
            </p>
            <div className="profile-onboarding-equipment">
              <div className="profile-onboarding-equipment-block">
                <p className="profile-onboarding-equipment-label">MAIN DRONES</p>
                <div className="profile-onboarding-equipment-row">
                  {extras.mainDrones.map((drone) => (
                    <span key={drone} className="profile-onboarding-equip-tag">
                      {drone} (Main)
                      <button
                        type="button"
                        className="profile-onboarding-equip-remove"
                        aria-label={`Remove ${drone}`}
                        disabled={!canEdit || loading}
                        onClick={() =>
                          patchExtras({
                            mainDrones: extras.mainDrones.filter((d) => d !== drone),
                          })
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    className="profile-onboarding-equip-add"
                    disabled={!canEdit || loading || !extras.droneEquipment.trim()}
                    onClick={addMainDroneFromEquipment}
                    title="Add from Drone Equipment field"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="profile-onboarding-equipment-block">
                <p className="profile-onboarding-equipment-label">PAYLOADS / ATTACHMENTS</p>
                <div className="profile-onboarding-equipment-row">
                  {extras.payloads.map((item) => (
                    <span key={item} className="profile-onboarding-equip-tag">
                      {item}
                      <button
                        type="button"
                        className="profile-onboarding-equip-remove"
                        aria-label={`Remove ${item}`}
                        disabled={!canEdit || loading}
                        onClick={() =>
                          patchExtras({
                            payloads: extras.payloads.filter((p) => p !== item),
                          })
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    className="profile-onboarding-equip-add"
                    disabled={!canEdit || loading}
                    onClick={() => {
                      patchExtras({ payloadPanelOpen: true });
                      requestAnimationFrame(() => {
                        document.getElementById("payloadDraft")?.focus();
                      });
                    }}
                    title="Add payload equipment"
                  >
                    +
                  </button>
                </div>
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

          <section className="profile-onboarding-section profile-onboarding-portfolio">
            <h2 className="profile-onboarding-section-title">PORTFOLIO</h2>
            <p className="profile-onboarding-portfolio-copy">
              Items come from your Flight Gallery. Add photos and video there to
              show them here and on your public profile.
            </p>
            {portfolioItems.length === 0 ? (
              <Link
                href="/dashboard/pilot/portfolio"
                className="profile-onboarding-portfolio-empty"
              >
                <span className="profile-onboarding-portfolio-add">+</span>
                <span className="profile-onboarding-portfolio-empty-title">
                  No gallery items yet
                </span>
                <span className="profile-onboarding-portfolio-empty-cta">
                  Open Flight Gallery →
                </span>
              </Link>
            ) : (
              <>
                <div className="profile-onboarding-portfolio-grid">
                  {portfolioItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href="/dashboard/pilot/portfolio"
                      className="profile-onboarding-portfolio-slot"
                    >
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.thumbnailUrl} alt={item.title} />
                      ) : (
                        <DroneIcon />
                      )}
                      <span className="profile-onboarding-portfolio-caption">
                        {item.title}
                      </span>
                    </Link>
                  ))}
                  <Link
                    href="/dashboard/pilot/portfolio"
                    className="profile-onboarding-portfolio-slot profile-onboarding-portfolio-slot--add"
                  >
                    <span className="profile-onboarding-portfolio-add">+</span>
                    <span className="profile-onboarding-portfolio-add-label">Add</span>
                  </Link>
                </div>
                <div className="profile-onboarding-portfolio-footer">
                  <span>
                    {portfolioItems.length} item
                    {portfolioItems.length === 1 ? "" : "s"} live
                  </span>
                  <Link
                    href="/dashboard/pilot/portfolio"
                    className="profile-onboarding-gallery-link"
                  >
                    Open Flight Gallery →
                  </Link>
                </div>
              </>
            )}
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
            {showCompliance ? (
              <div className="profile-onboarding-compliance">
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
              <label className="profile-onboarding-public-toggle">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => patchForm({ isPublic: e.target.checked })}
                  disabled={!canEdit || loading}
                />
                <span>List my profile in the public pilot directory</span>
              </label>
            ) : null}
          </section>
        </div>

        <div className="profile-onboarding-sidebar-stack">
          <ProfileStrengthPanel
            title="PROFILE STRENGTH"
            pct={strength.pct}
            subtitle="PROFILE COMPLETE"
            items={strength.items}
          />

          {extras.payloadPanelOpen ? (
          <aside className="profile-onboarding-payload-card">
            <div className="profile-onboarding-payload-head">
              <h2 className="profile-onboarding-payload-title">Add Payload Equipment</h2>
              <button
                type="button"
                className="profile-onboarding-payload-close"
                aria-label="Close add payload panel"
                disabled={!canEdit || loading}
                onClick={() =>
                  patchExtras({ payloadPanelOpen: false, payloadDraft: "" })
                }
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="profile-onboarding-payload-body">
              <div className="profile-onboarding-payload-field">
                <label className="profile-onboarding-label" htmlFor="payloadDraft">
                  EQUIPMENT GENERIC NAME
                </label>
                <input
                  id="payloadDraft"
                  className="profile-onboarding-input profile-onboarding-payload-input"
                  value={extras.payloadDraft}
                  maxLength={PAYLOAD_MAX}
                  onChange={(e) =>
                    patchExtras({ payloadDraft: e.target.value.slice(0, PAYLOAD_MAX) })
                  }
                  disabled={!canEdit || loading}
                  placeholder="Thermal Imaging Camera"
                />
                <p className="profile-onboarding-payload-hint">
                  Use the retail market generic name only. No long descriptions.
                </p>
              </div>

              <div
                className={`profile-onboarding-char-count${
                  extras.payloadDraft.length > 0 ? " profile-onboarding-char-count--active" : ""
                }`}
              >
                <span className="profile-onboarding-char-count-left">
                  {extras.payloadDraft.length > 0 ? (
                    <svg
                      className="profile-onboarding-char-check"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M3.5 8.25l3 3 6-6.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                  MAXIMUM {PAYLOAD_MAX} CHARACTERS
                </span>
                <span className="profile-onboarding-char-count-num">
                  {extras.payloadDraft.length} / {PAYLOAD_MAX}
                </span>
              </div>

              <div className="profile-onboarding-examples">
                <p className="profile-onboarding-examples-label">EXAMPLES</p>
                <div className="profile-onboarding-example-chips">
                  {PAYLOAD_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      className="profile-onboarding-example-chip"
                      disabled={!canEdit || loading}
                      onClick={() =>
                        patchExtras({ payloadDraft: example.slice(0, PAYLOAD_MAX) })
                      }
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-onboarding-payload-actions">
              <button
                type="button"
                className="profile-onboarding-payload-btn profile-onboarding-payload-btn--ghost"
                disabled={!canEdit || loading}
                onClick={() =>
                  patchExtras({ payloadPanelOpen: false, payloadDraft: "" })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-onboarding-payload-btn profile-onboarding-payload-btn--gold"
                disabled={
                  !canEdit ||
                  loading ||
                  !extras.payloadDraft.trim() ||
                  extras.payloadDraft.trim().length > PAYLOAD_MAX
                }
                onClick={addPayload}
              >
                Add equipment
              </button>
            </div>
          </aside>
          ) : null}
        </div>
      </div>

      <div className="profile-onboarding-actions">
        {previewHref ? (
          <Link href={previewHref} className="profile-onboarding-btn-outline">
            Preview Public Profile
          </Link>
        ) : (
          <button
            type="button"
            className="profile-onboarding-btn-outline"
            disabled
            title="Available after approval when profile is public"
          >
            Preview Public Profile
          </button>
        )}
        {canEdit ? (
          <button type="submit" className="profile-onboarding-btn-gold" disabled={loading}>
            {loading ? "Saving…" : "Save Profile"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
