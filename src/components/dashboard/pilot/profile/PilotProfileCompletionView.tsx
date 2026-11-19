"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PilotPortfolioAddModal } from "@/components/dashboard/pilot/portfolio/PilotPortfolioAddModal";
import { ProfileStrengthPanel } from "@/components/dashboard/shared/profile/ProfileStrengthPanel";
import { ComplianceChecklist } from "@/components/pilot/ComplianceChecklist";
import {
  emptyPilotFormState,
  pilotDtoToFormState,
  pilotFormToPayload,
  type PilotFormState,
} from "@/components/pilot/PilotProfileFormFields";
import { CountrySelect } from "@/components/ui/CountrySelect";
import { validateComplianceAcknowledgments } from "@/lib/pilot/compliance";
import { computePilotProfileStrength } from "@/lib/pilot/pilot-profile-strength";
import {
  type PilotPortfolioDraft,
  type PilotPortfolioItem,
} from "@/lib/pilot/portfolio";
import {
  emptyPilotProfileExtras,
  type PilotProfileExtras,
} from "@/lib/pilot/profile-extras";
import {
  isChipSelected,
  PILOT_PROFILE_SERVICE_CHIPS,
  servicesOfferedForSave,
  toggleServiceChip,
} from "@/lib/pilot/pilot-profile-service-chips";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import { isPublicPilotProfileEnabled } from "@/lib/public-access";
import type { PilotProfileDto } from "@/types/pilot";

const PORTFOLIO_API = "/api/pilot/portfolio" as const;
const PROFILE_DRAFT_STORAGE_KEY = "ras.pilotProfileDraft.v1";

type StoredProfileDraft = {
  profileId: string | null;
  form: PilotFormState;
  extras: PilotUiExtras;
  savedAt: number;
};

function readStoredProfileDraft(
  profileId: string | null,
): StoredProfileDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PROFILE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredProfileDraft;
    if (!parsed || typeof parsed !== "object") return null;
    if ((parsed.profileId ?? null) !== (profileId ?? null)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredProfileDraft(draft: StoredProfileDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PROFILE_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function clearStoredProfileDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PROFILE_DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

type PilotProfileCompletionViewProps = {
  profile: PilotProfileDto | null;
  insuranceVerified?: boolean;
  /** Approved license credentials from Verifications (read-only on profile). */
  approvedCredentials?: Array<{ catalogId: string; title: string }>;
  /** Platform certificates issued to this pilot. */
  certificates?: Array<{
    id: string;
    certificateNumber: string;
    templateName: string;
    issuedAt: string;
  }>;
  /** Highest-rarity earned wing for profile preview. */
  highestWing?: {
    title: string;
    imageUrl: string | null;
  } | null;
  /** Active marketplace operating regions (admin-managed). */
  operatingRegions?: Array<{ code: string; name: string }>;
};

type PilotUiExtras = {
  callSign: string;
  droneEquipment: string;
  languages: string;
  locationCity: string;
  locationRegion: string;
  serviceRadiusMi: string;
  hourlyRateDisplay: string;
  localChipIds: string[];
  operatingRegionCodes: string[];
  avatarPreview: string | null;
  mainDrones: string[];
  payloads: string[];
  payloadDraft: string;
  payloadPanelOpen: boolean;
  notifications: PilotProfileExtras["notifications"];
};

const PAYLOAD_MAX = 22;
const PAYLOAD_EXAMPLES = ["LiDAR Scanner", "Thermal Imaging Camera"] as const;

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
    locationCity: form.locationCity,
    locationRegion: form.locationRegion,
    serviceRadiusMi: kmToMi(form.serviceRadiusKm),
    hourlyRateDisplay: form.hourlyRateMin || form.hourlyRateMax || "",
    localChipIds: extras.localChipIds,
    operatingRegionCodes: extras.operatingRegionCodes,
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
    operatingRegionCodes: extras.operatingRegionCodes,
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
    <span className="profile-onboarding-dollar-sign" aria-hidden>
      $
    </span>
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
  approvedCredentials = [],
  certificates = [],
  highestWing = null,
  operatingRegions = [],
}: PilotProfileCompletionViewProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PilotFormState>(() => {
    if (!profile) return emptyPilotFormState;
    const base = pilotDtoToFormState(profile);
    // Draft placeholder from ensurePilotDraftProfile — start with empty name in the form.
    if (
      profile.displayName === "New Pilot" &&
      !profile.onboardingCompletedAt
    ) {
      return { ...base, displayName: "" };
    }
    return base;
  });
  const [extras, setExtras] = useState<PilotUiExtras>(() => buildExtras(profile));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<PilotPortfolioItem[]>(
    () => profile?.portfolio ?? [],
  );
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] =
    useState<PilotPortfolioItem | null>(null);
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const canEdit = !profile || profile.status !== "suspended";
  const needsOnboarding = !profile?.onboardingCompletedAt;
  const [isEditing, setIsEditing] = useState(needsOnboarding);
  const fieldsLocked = !canEdit || (!needsOnboarding && !isEditing);
  const profileId = profile?.id ?? null;

  useEffect(() => {
    const stored = readStoredProfileDraft(profileId);
    if (stored) {
      setForm(stored.form);
      setExtras(stored.extras);
      if (!needsOnboarding) setIsEditing(true);
    }
    setDraftHydrated(true);
    // Restore once per mount / profile id.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount hydrate
  }, [profileId]);

  useEffect(() => {
    if (!draftHydrated || !canEdit) return;
    if (!needsOnboarding && !isEditing) return;
    writeStoredProfileDraft({
      profileId,
      form,
      extras,
      savedAt: Date.now(),
    });
  }, [
    draftHydrated,
    canEdit,
    needsOnboarding,
    isEditing,
    profileId,
    form,
    extras,
  ]);

  function persistDraftToSession() {
    if (!canEdit) return;
    if (!needsOnboarding && !isEditing) return;
    writeStoredProfileDraft({
      profileId,
      form,
      extras,
      savedAt: Date.now(),
    });
  }
  const isRejected = profile?.status === "rejected";
  const showCompliance = needsOnboarding || isRejected;
  /** Placeholder draft from ensurePilotDraftProfile — treat like empty for UX copy. */
  const isPlaceholderDraft =
    Boolean(profile) &&
    profile!.displayName === "New Pilot" &&
    needsOnboarding &&
    (profile!.servicesOffered?.length ?? 0) === 0;

  const strength = useMemo(
    () =>
      computePilotProfileStrength({
        form: {
          displayName: form.displayName,
          bio: form.bio,
          locationCity: extras.locationCity || form.locationCity,
          locationCountry: form.locationCountry,
          servicesOffered: form.servicesOffered,
          complianceAcknowledged: form.complianceAcknowledged,
        },
        avatarPreview: extras.avatarPreview,
        portfolioCount: portfolioItems.length,
        insuranceVerified,
        mainDrones: extras.mainDrones,
        payloads: extras.payloads,
        localChipIds: extras.localChipIds,
        complianceAccepted: Boolean(profile?.complianceAcceptedAt),
      }),
    [
      form,
      extras.locationCity,
      extras.avatarPreview,
      extras.mainDrones,
      extras.payloads,
      extras.localChipIds,
      portfolioItems.length,
      insuranceVerified,
      profile?.complianceAcceptedAt,
    ],
  );

  function openPortfolioAdd() {
    setEditingPortfolioItem(null);
    setPortfolioModalOpen(true);
  }

  function openPortfolioEdit(item: PilotPortfolioItem) {
    setEditingPortfolioItem(item);
    setPortfolioModalOpen(true);
  }

  function closePortfolioModal() {
    if (portfolioSaving) return;
    setPortfolioModalOpen(false);
    setEditingPortfolioItem(null);
  }

  async function handlePortfolioSave(draft: PilotPortfolioDraft) {
    setPortfolioSaving(true);
    setError(null);
    const editingId = editingPortfolioItem?.id;
    try {
      const res = await fetch(
        editingId ? `${PORTFOLIO_API}/${editingId}` : PORTFOLIO_API,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save gallery item.");
        return;
      }
      if (Array.isArray(data.items)) {
        setPortfolioItems(data.items as PilotPortfolioItem[]);
      } else if (data.item && typeof data.item === "object") {
        const saved = data.item as PilotPortfolioItem;
        setPortfolioItems((current) => {
          if (editingId) {
            return current.map((row) => (row.id === editingId ? saved : row));
          }
          return [saved, ...current];
        });
      }
      setSuccess(
        editingId
          ? `"${draft.title}" was updated in your gallery.`
          : `"${draft.title}" added to your gallery.`,
      );
      setPortfolioModalOpen(false);
      setEditingPortfolioItem(null);
    } catch {
      setError("Failed to save gallery item.");
    } finally {
      setPortfolioSaving(false);
    }
  }

  async function handlePortfolioRemove(item: PilotPortfolioItem) {
    if (
      !window.confirm(
        `Remove "${item.title}" from your gallery? You stay on this page.`,
      )
    ) {
      return;
    }
    setPortfolioSaving(true);
    setError(null);
    try {
      const res = await fetch(`${PORTFOLIO_API}/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (data as { error?: string }).error ?? "Failed to remove gallery item.",
        );
        return;
      }
      if (Array.isArray((data as { items?: unknown }).items)) {
        setPortfolioItems((data as { items: PilotPortfolioItem[] }).items);
      } else {
        setPortfolioItems((current) => current.filter((row) => row.id !== item.id));
      }
      setSuccess(`"${item.title}" was removed from your gallery.`);
    } catch {
      setError("Failed to remove gallery item.");
    } finally {
      setPortfolioSaving(false);
    }
  }

  // Owner can always preview their own profile (even before approval/public).
  const previewHref =
    isPublicPilotProfileEnabled() && profile?.id
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
    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }
    patchExtras({ avatarPreview: result.url });

    // Persist immediately when a profile already exists so leave-without-Save
    // does not drop the new avatar.
    if (profile) {
      const nextExtras = extrasPayload({
        ...extras,
        avatarPreview: result.url,
      });
      const res = await fetch("/api/pilot/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extras: nextExtras,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoading(false);
        setError(
          (data as { error?: string }).error ??
            "Avatar uploaded but failed to save to profile. Click Save Profile.",
        );
        return;
      }
      setSuccess("Avatar saved.");
    }
    setLoading(false);
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

  function buildMergedForm(): PilotFormState {
    return {
      ...form,
      locationCity: extras.locationCity.trim(),
      locationRegion: extras.locationRegion.trim(),
      serviceRadiusKm: miToKm(extras.serviceRadiusMi),
      hourlyRateMin: extras.hourlyRateDisplay,
      hourlyRateMax: extras.hourlyRateDisplay || form.hourlyRateMax,
      servicesOffered: servicesOfferedForSave(
        form.servicesOffered,
        extras.localChipIds,
      ),
    };
  }

  function toggleOperatingRegion(code: string) {
    setExtras((current) => {
      const selected = current.operatingRegionCodes.includes(code);
      return {
        ...current,
        operatingRegionCodes: selected
          ? current.operatingRegionCodes.filter((c) => c !== code)
          : [...current.operatingRegionCodes, code],
      };
    });
  }

  function beginEditing() {
    setSuccess(null);
    setError(null);
    setIsEditing(true);
    window.setTimeout(() => {
      const field = document.getElementById("displayName");
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus();
    }, 80);
  }

  function cancelEditing() {
    setExtras(buildExtras(profile));
    if (profile) setForm(pilotDtoToFormState(profile));
    setIsEditing(false);
    clearStoredProfileDraft();
    setError(null);
    setSuccess(null);
  }

  function renderProfileActions(placement: "sidebar" | "mobile") {
    const showEdit = canEdit && !needsOnboarding && !isEditing;
    const showSaveControls = canEdit && (needsOnboarding || isEditing);

    return (
      <div
        className={
          placement === "sidebar"
            ? "profile-onboarding-action-panel"
            : "profile-onboarding-actions profile-onboarding-actions--mobile"
        }
      >
        {placement === "sidebar" ? (
          <p className="profile-onboarding-action-hint">
            {needsOnboarding
              ? "Finish required fields, then submit for review."
              : isEditing
                ? "You are editing. Save when finished, or cancel to discard."
                : "Profile is view-only until you unlock it."}
          </p>
        ) : null}
        {previewHref && !isPlaceholderDraft ? (
          <Link
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-onboarding-btn-outline"
          >
            Preview Public Profile
          </Link>
        ) : (
          <button
            type="button"
            className="profile-onboarding-btn-outline"
            disabled
            title="Save your profile first to preview"
          >
            Preview Public Profile
          </button>
        )}
        {showEdit ? (
          <button
            type="button"
            className="profile-onboarding-btn-gold"
            onClick={beginEditing}
          >
            Edit profile
          </button>
        ) : null}
        {showSaveControls ? (
          <>
            {!needsOnboarding ? (
              <button
                type="button"
                className="profile-onboarding-btn-outline"
                disabled={loading}
                onClick={cancelEditing}
              >
                Cancel
              </button>
            ) : null}
            {needsOnboarding ? (
              <button
                type="submit"
                className="profile-onboarding-btn-outline"
                disabled={loading}
              >
                {loading ? "Saving…" : "Save draft"}
              </button>
            ) : null}
            {needsOnboarding || isRejected ? (
              <button
                type="button"
                className="profile-onboarding-btn-gold"
                disabled={loading}
                onClick={() => void handleSubmitForReview()}
              >
                {loading
                  ? "Submitting…"
                  : isRejected
                    ? "Resubmit for review"
                    : "Submit for review"}
              </button>
            ) : (
              <button
                type="button"
                className="profile-onboarding-btn-gold"
                disabled={loading}
                onClick={() => void persistProfile({ completeOnboarding: false })}
              >
                {loading ? "Saving…" : "Save Profile"}
              </button>
            )}
          </>
        ) : null}
      </div>
    );
  }

  function validateForSubmit(merged: PilotFormState): string | null {
    if (merged.displayName.trim().length < 2) {
      return "Display name is required (at least 2 characters).";
    }
    if (!merged.locationCity.trim() || !merged.locationCountry.trim()) {
      return "City and country are required for your service location.";
    }
    if (merged.servicesOffered.length === 0) {
      return "Select at least one service you offer.";
    }
    if (!validateComplianceAcknowledgments(merged.complianceAcknowledged)) {
      return "You must accept all compliance checklist items to continue.";
    }
    return null;
  }

  async function persistProfile(opts: {
    completeOnboarding: boolean;
  }): Promise<boolean> {
    setError(null);
    setSuccess(null);

    const mergedForm = buildMergedForm();
    if (opts.completeOnboarding) {
      const clientError = validateForSubmit(mergedForm);
      if (clientError) {
        setError(clientError);
        return false;
      }
    } else if (mergedForm.displayName.trim().length < 2) {
      // Draft still needs a name so the row is identifiable.
      setError("Enter a display name before saving a draft.");
      return false;
    }

    setLoading(true);
    const extrasToSave = extrasPayload(extras);
    const payload = {
      ...pilotFormToPayload(mergedForm, opts.completeOnboarding),
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
      return false;
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
    clearStoredProfileDraft();
    if (!opts.completeOnboarding && !needsOnboarding) {
      setIsEditing(false);
    }
    setSuccess(
      opts.completeOnboarding
        ? isRejected
          ? "Profile resubmitted for admin review."
          : "Profile submitted for review."
        : needsOnboarding
          ? "Draft saved. You can leave this page without losing your work."
          : "Profile updated.",
    );
    router.refresh();
    return true;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Never force submit-for-review on plain Save — that wiped mid-flow and blocked drafts.
    await persistProfile({ completeOnboarding: false });
  }

  async function handleSubmitForReview() {
    await persistProfile({ completeOnboarding: true });
  }

  return (
    <form className="profile-onboarding-page" onSubmit={(e) => void handleSave(e)}>
      <header className="profile-onboarding-header profile-onboarding-bracket-card">
        <div className="profile-onboarding-header-row">
          <div>
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
          </div>
          {canEdit && !needsOnboarding ? (
            <span
              className={`profile-onboarding-mode-pill${
                isEditing ? " profile-onboarding-mode-pill--editing" : ""
              }`}
            >
              {isEditing ? "Editing" : "Viewing"}
            </span>
          ) : null}
        </div>
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
        <div
          className={`profile-onboarding-main${
            fieldsLocked ? " profile-onboarding-main--locked" : ""
          }`}
        >
          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">IDENTITY</h2>
            <div className="profile-onboarding-identity-grid">
              <button
                type="button"
                className="profile-onboarding-avatar-btn"
                onClick={() => avatarInputRef.current?.click()}
                disabled={fieldsLocked || loading}
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
                    disabled={fieldsLocked || loading}
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
                    disabled={fieldsLocked || loading}
                    placeholder="Max 12 characters"
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="locationCity">
                    CITY
                  </label>
                  <div className="profile-onboarding-input-wrap">
                    <span className="profile-onboarding-input-icon">
                      <PinIcon />
                    </span>
                    <input
                      id="locationCity"
                      className="profile-onboarding-input"
                      value={extras.locationCity}
                      onChange={(e) => patchExtras({ locationCity: e.target.value })}
                      disabled={fieldsLocked || loading}
                      placeholder="Austin"
                    />
                  </div>
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="locationRegion">
                    STATE / PROVINCE
                  </label>
                  <input
                    id="locationRegion"
                    className="profile-onboarding-input"
                    value={extras.locationRegion}
                    onChange={(e) => patchExtras({ locationRegion: e.target.value })}
                    disabled={fieldsLocked || loading}
                    placeholder="TX"
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="locationCountry">
                    COUNTRY
                  </label>
                  <CountrySelect
                    id="locationCountry"
                    className="profile-onboarding-input"
                    value={form.locationCountry}
                    onChange={(locationCountry) => patchForm({ locationCountry })}
                    disabled={fieldsLocked || loading}
                    required
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="serviceRadius">
                    SERVICE RADIUS (MI)
                  </label>
                  <input
                    id="serviceRadius"
                    className="profile-onboarding-input"
                    value={extras.serviceRadiusMi}
                    onChange={(e) => patchExtras({ serviceRadiusMi: e.target.value })}
                    disabled={fieldsLocked || loading}
                    placeholder="120"
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="licenseNumber">
                    LICENSE NUMBER
                  </label>
                  <input
                    id="licenseNumber"
                    className="profile-onboarding-input"
                    value={form.licenseNumber}
                    onChange={(e) => patchForm({ licenseNumber: e.target.value })}
                    disabled={fieldsLocked || loading}
                    placeholder="Part 107 / remote license #"
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
                disabled={fieldsLocked || loading}
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
                    disabled={fieldsLocked || loading}
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
                  disabled={fieldsLocked || loading}
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
                  disabled={fieldsLocked || loading}
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
                        disabled={fieldsLocked || loading}
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
                    disabled={fieldsLocked || loading}
                    onClick={() => {
                      if (!extras.droneEquipment.trim()) {
                        document.getElementById("droneEquipment")?.focus();
                        return;
                      }
                      addMainDroneFromEquipment();
                    }}
                    title="Add from Drone Equipment field above"
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
                        disabled={fieldsLocked || loading}
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
                    disabled={fieldsLocked || loading}
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
                    disabled={fieldsLocked || loading}
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
            <h2 className="profile-onboarding-section-title">SERVICE REGIONS</h2>
            <p className="profile-onboarding-section-copy">
              Choose the regions where you are willing to work (for example North
              America, Middle East). City and state above are your home base;
              these chips are where you will take jobs.
            </p>
            {operatingRegions.length === 0 ? (
              <p className="profile-onboarding-section-copy">
                No operating regions are available yet. An admin can add them under
                Regions.
              </p>
            ) : (
              <div className="profile-onboarding-chips" role="group" aria-label="Service regions">
                {operatingRegions.map((region) => {
                  const selected = extras.operatingRegionCodes.includes(region.code);
                  return (
                    <button
                      key={region.code}
                      type="button"
                      className={`profile-onboarding-chip${selected ? " profile-onboarding-chip--active" : ""}`}
                      disabled={fieldsLocked || loading}
                      aria-pressed={selected}
                      onClick={() => toggleOperatingRegion(region.code)}
                    >
                      {region.name}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="profile-onboarding-section profile-onboarding-portfolio">
            <h2 className="profile-onboarding-section-title">PORTFOLIO</h2>
            <p className="profile-onboarding-portfolio-copy">
              Add gallery items here without leaving this page — your profile
              fields stay filled. They also appear on your public listing.
            </p>
            {portfolioItems.length === 0 ? (
              <button
                type="button"
                className="profile-onboarding-portfolio-empty"
                disabled={!canEdit || portfolioSaving}
                onClick={openPortfolioAdd}
              >
                <span className="profile-onboarding-portfolio-add">+</span>
                <span className="profile-onboarding-portfolio-empty-title">
                  No gallery items yet
                </span>
                <span className="profile-onboarding-portfolio-empty-cta">
                  Add gallery item
                </span>
              </button>
            ) : (
              <>
                <div className="profile-onboarding-portfolio-grid">
                  {portfolioItems.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="profile-onboarding-portfolio-slot-wrap"
                    >
                      <button
                        type="button"
                        className="profile-onboarding-portfolio-slot"
                        disabled={!canEdit || portfolioSaving}
                        onClick={() => openPortfolioEdit(item)}
                        title="Edit gallery item"
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
                      </button>
                      {canEdit ? (
                        <button
                          type="button"
                          className="profile-onboarding-portfolio-remove"
                          disabled={portfolioSaving}
                          onClick={() => void handlePortfolioRemove(item)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="profile-onboarding-portfolio-slot profile-onboarding-portfolio-slot--add"
                    disabled={!canEdit || portfolioSaving}
                    onClick={openPortfolioAdd}
                  >
                    <span className="profile-onboarding-portfolio-add">+</span>
                    <span className="profile-onboarding-portfolio-add-label">
                      Add
                    </span>
                  </button>
                </div>
                <div className="profile-onboarding-portfolio-footer">
                  <span>
                    {portfolioItems.length} item
                    {portfolioItems.length === 1 ? "" : "s"} live
                  </span>
                  <button
                    type="button"
                    className="profile-onboarding-gallery-link"
                    disabled={!canEdit || portfolioSaving}
                    onClick={openPortfolioAdd}
                  >
                    Add another item
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">LICENSE &amp; COMPLIANCE</h2>
            <p className="profile-onboarding-section-note">
              Licenses and certificates appear here after admin approval on{" "}
              <Link
                href="/dashboard/pilot/verifications"
                className="profile-onboarding-inline-link"
                onClick={persistDraftToSession}
              >
                Verification
              </Link>
              . They are not editable on this page.
            </p>
            {approvedCredentials.length > 0 ? (
              <ul className="profile-onboarding-credential-list" aria-label="Approved credentials">
                {approvedCredentials.map((cred) => (
                  <li key={cred.catalogId} className="profile-onboarding-credential-chip">
                    {cred.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-onboarding-muted">
                No approved licenses yet. Upload FAA Part 107, EASA classes, aircraft
                registration, insurance, or business registration under Verification.
              </p>
            )}

            <div className="profile-onboarding-insurance-block">
              <h3 className="profile-onboarding-subsection-title">Insurance</h3>
              <p className="profile-onboarding-muted">
                {insuranceVerified
                  ? "Liability insurance is verified on your account."
                  : "Upload proof of liability insurance under Verification. It is reviewed by staff and counts toward profile strength."}
              </p>
              <Link
                href="/dashboard/pilot/verifications"
                className="profile-onboarding-inline-link"
                onClick={persistDraftToSession}
              >
                {insuranceVerified
                  ? "View verification documents →"
                  : "Upload insurance document →"}
              </Link>
            </div>

            {showCompliance ? (
              <div className="profile-onboarding-compliance">
                <ComplianceChecklist
                  value={form.complianceAcknowledged}
                  onChange={(complianceAcknowledged) =>
                    patchForm({ complianceAcknowledged })
                  }
                  disabled={fieldsLocked || loading}
                />
              </div>
            ) : null}
            {profile?.status === "approved" ? (
              <label className="profile-onboarding-public-toggle">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => patchForm({ isPublic: e.target.checked })}
                  disabled={fieldsLocked || loading}
                />
                <span>List my profile in the public pilot directory</span>
              </label>
            ) : null}
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">PLATFORM CERTIFICATES</h2>
            <p className="profile-onboarding-section-note">
              Certificates issued by Remote Air Service admins.
              {!needsOnboarding ? (
                <>
                  {" "}
                  <Link
                    href="/dashboard/pilot/certificates"
                    className="profile-onboarding-inline-link"
                  >
                    Open Certificates page →
                  </Link>
                </>
              ) : (
                " Finish and submit your profile to unlock Certificates and Wings."
              )}
            </p>
            {highestWing ? (
              <div className="profile-onboarding-highest-wing">
                {highestWing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={highestWing.imageUrl}
                    alt=""
                    className="profile-onboarding-highest-wing-img"
                  />
                ) : null}
                <div>
                  <p className="profile-onboarding-label">Highest earned wing</p>
                  <p className="profile-onboarding-award-title">{highestWing.title}</p>
                  {!needsOnboarding ? (
                    <Link
                      href="/dashboard/pilot/achievements"
                      className="profile-onboarding-inline-link"
                    >
                      View Digital Wings →
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="profile-onboarding-muted">
                No wings earned yet.
                {!needsOnboarding ? (
                  <>
                    {" "}
                    <Link
                      href="/dashboard/pilot/verifications/request-wings"
                      className="profile-onboarding-inline-link"
                      onClick={persistDraftToSession}
                    >
                      Request Wings →
                    </Link>
                  </>
                ) : null}
              </p>
            )}
            {certificates.length > 0 ? (
              <ul className="profile-onboarding-credential-list">
                {certificates.map((cert) => (
                  <li key={cert.id} className="profile-onboarding-credential-chip">
                    <span>{cert.templateName}</span>
                    <span className="profile-onboarding-credential-meta">
                      {cert.certificateNumber}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-onboarding-muted">
                No platform certificates issued yet.
              </p>
            )}
          </section>
        </div>

        <div className="profile-onboarding-sidebar-stack">
          <ProfileStrengthPanel
            title="PROFILE STRENGTH"
            pct={strength.pct}
            subtitle="PROFILE COMPLETE"
            items={strength.items}
          />

          {renderProfileActions("sidebar")}

          {extras.payloadPanelOpen ? (
          <aside className="profile-onboarding-payload-card">
            <div className="profile-onboarding-payload-head">
              <h2 className="profile-onboarding-payload-title">Add Payload Equipment</h2>
              <button
                type="button"
                className="profile-onboarding-payload-close"
                aria-label="Close add payload panel"
                disabled={fieldsLocked || loading}
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
                  disabled={fieldsLocked || loading}
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
                      disabled={fieldsLocked || loading}
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
                disabled={fieldsLocked || loading}
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

      {renderProfileActions("mobile")}

      <PilotPortfolioAddModal
        open={portfolioModalOpen}
        item={editingPortfolioItem}
        saving={portfolioSaving}
        onClose={closePortfolioModal}
        onSave={(draft) => void handlePortfolioSave(draft)}
      />
    </form>
  );
}
