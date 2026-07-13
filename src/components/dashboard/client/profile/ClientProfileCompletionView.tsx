"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AvatarFrameEditor } from "@/components/dashboard/shared/profile/AvatarFrameEditor";
import { ProfileStrengthPanel } from "@/components/dashboard/shared/profile/ProfileStrengthPanel";
import {
  clientDtoToFormState,
  clientFormToPayload,
  emptyClientFormState,
  type ClientFormState,
} from "@/components/client/ClientProfileFormFields";
import { CLIENT_PROFILE_PROJECT_CHIPS } from "@/lib/client/client-profile-project-chips";
import { computeClientProfileStrength } from "@/lib/client/client-profile-strength";
import { getClientProfileStatusLabel } from "@/lib/client/status";
import type { ClientProfileDto } from "@/types/client";

type ClientProfileCompletionViewProps = {
  profile: ClientProfileDto | null;
  accountEmail?: string;
};

type ClientUiExtras = {
  roleTitle: string;
  location: string;
  primaryEmail: string;
  preferredContact: "Email" | "Phone" | "Messages";
  typicalProjectArea: string;
  defaultBudgetRange: string;
  approvalContact: string;
  billingEmail: string;
  paymentConnected: boolean;
  projectTypes: string[];
  logoPreview: string | null;
};

const PREFERRED_CONTACTS = ["Email", "Phone", "Messages"] as const;

function buildClientExtras(
  profile: ClientProfileDto | null,
  accountEmail?: string,
): ClientUiExtras {
  const form = profile ? clientDtoToFormState(profile) : emptyClientFormState;
  const billing = profile?.billingAddress;
  const prefs = profile?.preferences;
  return {
    roleTitle: prefs?.roleTitle ?? "",
    location: formatLocation(billing?.city ?? "", billing?.region ?? ""),
    primaryEmail: accountEmail ?? "",
    preferredContact: prefs?.preferredContact ?? "Email",
    typicalProjectArea: prefs?.typicalProjectArea ?? "",
    defaultBudgetRange: prefs?.defaultBudgetRange ?? "",
    approvalContact: prefs?.approvalContact || form.contactName,
    billingEmail: prefs?.billingEmail || accountEmail || "",
    paymentConnected: false,
    projectTypes: prefs?.projectTypes?.length
      ? [...prefs.projectTypes]
      : [],
    logoPreview: prefs?.logoPath ?? null,
  };
}

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

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="13" r="3.25" />
    </svg>
  );
}

export function ClientProfileCompletionView({
  profile,
  accountEmail,
}: ClientProfileCompletionViewProps) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [form, setForm] = useState<ClientFormState>(() =>
    profile ? clientDtoToFormState(profile) : emptyClientFormState,
  );
  const [extras, setExtras] = useState<ClientUiExtras>(() =>
    buildClientExtras(profile, accountEmail),
  );
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function releaseObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function openFilePicker() {
    logoInputRef.current?.click();
  }

  function handleFileSelected(file: File) {
    releaseObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setEditorSrc(url);
  }

  function handleAvatarClick() {
    if (extras.logoPreview) {
      setEditorSrc(extras.logoPreview);
    } else {
      openFilePicker();
    }
  }

  function handleEditorSave(dataUrl: string) {
    setEditorSrc(null);
    releaseObjectUrl();
    patchExtras({ logoPreview: dataUrl });
  }

  function handleEditorCancel() {
    setEditorSrc(null);
    releaseObjectUrl();
  }

  function handleRemoveLogo() {
    releaseObjectUrl();
    patchExtras({ logoPreview: null });
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  const canEdit = !profile || profile.status !== "suspended";
  const needsOnboarding = !profile?.onboardingCompletedAt;

  const strength = useMemo(
    () => computeClientProfileStrength(form, extras),
    [form, extras],
  );

  function patchForm(patch: Partial<ClientFormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function patchExtras(patch: Partial<ClientUiExtras>) {
    setExtras((e) => ({ ...e, ...patch }));
  }

  function toggleProjectType(chip: string) {
    setExtras((e) => {
      const selected = e.projectTypes.includes(chip);
      return {
        ...e,
        projectTypes: selected
          ? e.projectTypes.filter((c) => c !== chip)
          : [...e.projectTypes, chip],
      };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const loc = parseLocation(extras.location);
    const mergedForm: ClientFormState = {
      ...form,
      billingCity: loc.city,
      billingRegion: loc.region,
    };

    const payload = {
      ...clientFormToPayload(mergedForm, needsOnboarding),
      preferences: {
        roleTitle: extras.roleTitle,
        preferredContact: extras.preferredContact,
        typicalProjectArea: extras.typicalProjectArea,
        defaultBudgetRange: extras.defaultBudgetRange,
        approvalContact: extras.approvalContact,
        billingEmail: extras.billingEmail,
        projectTypes: extras.projectTypes,
        logoPath: extras.logoPreview,
      },
    };
    const method = profile ? "PATCH" : "POST";
    const res = await fetch("/api/client/profile", {
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
        ? "Client profile saved. You can post projects after setup is complete."
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
            {getClientProfileStatusLabel(profile.status)}
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
            <h2 className="profile-onboarding-section-title">CLIENT IDENTITY</h2>
            <div className="profile-onboarding-identity-grid">
              <div className="profile-onboarding-avatar-cell">
                <button
                  type="button"
                  className="profile-onboarding-avatar-btn"
                  onClick={handleAvatarClick}
                  disabled={!canEdit || loading}
                  aria-label={extras.logoPreview ? "Adjust logo" : "Upload logo"}
                >
                  {extras.logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={extras.logoPreview} alt="" />
                  ) : (
                    <>
                      <CameraIcon />
                      <span className="profile-onboarding-avatar-label">UPLOAD</span>
                    </>
                  )}
                </button>
                {extras.logoPreview ? (
                  <div className="profile-onboarding-avatar-actions">
                    <button
                      type="button"
                      className="profile-onboarding-avatar-action"
                      onClick={openFilePicker}
                      disabled={!canEdit || loading}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      className="profile-onboarding-avatar-action profile-onboarding-avatar-action--danger"
                      onClick={handleRemoveLogo}
                      disabled={!canEdit || loading}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="profile-onboarding-hidden-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelected(file);
                  e.target.value = "";
                }}
              />

              <div className="profile-onboarding-fields profile-onboarding-fields--2">
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="contactName">
                    DISPLAY NAME
                  </label>
                  <input
                    id="contactName"
                    className="profile-onboarding-input"
                    value={form.contactName}
                    onChange={(e) => patchForm({ contactName: e.target.value })}
                    disabled={!canEdit || loading}
                    required
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="companyName">
                    COMPANY / ORGANIZATION
                  </label>
                  <input
                    id="companyName"
                    className="profile-onboarding-input"
                    value={form.companyName}
                    onChange={(e) => patchForm({ companyName: e.target.value })}
                    disabled={!canEdit || loading}
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="roleTitle">
                    ROLE / TITLE
                  </label>
                  <input
                    id="roleTitle"
                    className="profile-onboarding-input"
                    value={extras.roleTitle}
                    onChange={(e) => patchExtras({ roleTitle: e.target.value })}
                    disabled={!canEdit || loading}
                    placeholder="Operations Manager"
                  />
                </div>
                <div className="profile-onboarding-field">
                  <label className="profile-onboarding-label" htmlFor="clientLocation">
                    LOCATION
                  </label>
                  <input
                    id="clientLocation"
                    className="profile-onboarding-input"
                    value={extras.location}
                    onChange={(e) => patchExtras({ location: e.target.value })}
                    disabled={!canEdit || loading}
                    placeholder="Dallas, TX"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">
              CONTACT &amp; PROJECT PREFERENCES
            </h2>
            <div className="profile-onboarding-fields profile-onboarding-fields--2">
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="primaryEmail">
                  PRIMARY EMAIL
                </label>
                <input
                  id="primaryEmail"
                  type="email"
                  className="profile-onboarding-input"
                  value={extras.primaryEmail}
                  onChange={(e) => patchExtras({ primaryEmail: e.target.value })}
                  disabled={!canEdit || loading}
                />
              </div>
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="phone">
                  PHONE
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="profile-onboarding-input"
                  value={form.phone}
                  onChange={(e) => patchForm({ phone: e.target.value })}
                  disabled={!canEdit || loading}
                />
              </div>
            </div>
            <div className="profile-onboarding-field" style={{ marginTop: "1rem" }}>
              <span className="profile-onboarding-label">PREFERRED CONTACT</span>
              <div className="profile-onboarding-chips">
                {PREFERRED_CONTACTS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`profile-onboarding-chip${extras.preferredContact === option ? " profile-onboarding-chip--active" : ""}`}
                    disabled={!canEdit || loading}
                    onClick={() => patchExtras({ preferredContact: option })}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="profile-onboarding-field" style={{ marginTop: "1rem" }}>
              <label className="profile-onboarding-label" htmlFor="typicalProjectArea">
                TYPICAL PROJECT AREA
              </label>
              <input
                id="typicalProjectArea"
                className="profile-onboarding-input"
                value={extras.typicalProjectArea}
                onChange={(e) => patchExtras({ typicalProjectArea: e.target.value })}
                disabled={!canEdit || loading}
                placeholder="Texas / Southern US"
              />
            </div>
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">PROJECT TYPES NEEDED</h2>
            <div className="profile-onboarding-chips">
              {CLIENT_PROFILE_PROJECT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`profile-onboarding-chip${extras.projectTypes.includes(chip) ? " profile-onboarding-chip--active" : ""}`}
                  disabled={!canEdit || loading}
                  onClick={() => toggleProjectType(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </section>

          <section className="profile-onboarding-section">
            <h2 className="profile-onboarding-section-title">HIRING READINESS</h2>
            <div className="profile-onboarding-status-row">
              <span className="profile-onboarding-status-label">Payment Method</span>
              <span
                className={`profile-onboarding-strength-pill profile-onboarding-strength-pill--${extras.paymentConnected ? "done" : "missing"}`}
              >
                {extras.paymentConnected ? "CONNECTED" : "PENDING"}
              </span>
            </div>
            <div className="profile-onboarding-fields profile-onboarding-fields--2" style={{ marginTop: "1rem" }}>
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="billingEmail">
                  BILLING EMAIL
                </label>
                <input
                  id="billingEmail"
                  className="profile-onboarding-input"
                  value={extras.billingEmail}
                  onChange={(e) => patchExtras({ billingEmail: e.target.value })}
                  disabled={!canEdit || loading}
                />
              </div>
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="defaultBudgetRange">
                  DEFAULT BUDGET RANGE
                </label>
                <input
                  id="defaultBudgetRange"
                  className="profile-onboarding-input"
                  value={extras.defaultBudgetRange}
                  onChange={(e) => patchExtras({ defaultBudgetRange: e.target.value })}
                  disabled={!canEdit || loading}
                />
              </div>
              <div className="profile-onboarding-field">
                <label className="profile-onboarding-label" htmlFor="approvalContact">
                  APPROVAL CONTACT
                </label>
                <input
                  id="approvalContact"
                  className="profile-onboarding-input"
                  value={extras.approvalContact}
                  onChange={(e) => patchExtras({ approvalContact: e.target.value })}
                  disabled={!canEdit || loading}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-ras-soft">
              Payment integration pending (M12).{" "}
              <Link href="/dashboard/client/payments" className="text-gold hover:underline">
                Billing →
              </Link>
            </p>
          </section>
        </div>

        <ProfileStrengthPanel
          title="ONBOARDING STATUS"
          pct={strength.pct}
          subtitle="CLIENT PROFILE COMPLETE"
          items={strength.items}
        />
      </div>

      <div className="profile-onboarding-actions">
        {canEdit ? (
          <button type="submit" className="profile-onboarding-btn-gold" disabled={loading}>
            {loading ? "Saving…" : "Save Profile"}
          </button>
        ) : null}
      </div>

      {editorSrc ? (
        <AvatarFrameEditor
          src={editorSrc}
          onCancel={handleEditorCancel}
          onSave={handleEditorSave}
        />
      ) : null}
    </form>
  );
}
