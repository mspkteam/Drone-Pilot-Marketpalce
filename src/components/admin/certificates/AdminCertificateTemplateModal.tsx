"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CertificateCanvas } from "@/components/admin/certificates/CertificateCanvas";
import { CertificateOverlayFieldEditor } from "@/components/admin/certificates/CertificateOverlayFieldEditor";
import { DashboardModalPortal } from "@/components/ui/DashboardModalPortal";
import { DEFAULT_CERTIFICATE_BODY } from "@/lib/admin/certificate-display";
import { CERTIFICATE_CONDITION_CATALOG } from "@/lib/certificates/conditions";
import {
  ALL_OVERLAY_FIELDS,
  getCertificateLayout,
  getEffectiveFieldOverrides,
  OVERLAY_FIELD_LABELS,
  setActiveOverlayFields,
  type CertificateOverlayField,
  type OverlayFieldOverride,
} from "@/lib/certificates/layouts";
import type {
  AdminCertificateTemplateCardDto,
  CertificateTemplateFormInput,
} from "@/types/admin-certificates";

type AdminCertificateTemplateModalProps = {
  mode: "create" | "edit";
  template: AdminCertificateTemplateCardDto | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: CertificateTemplateFormInput) => void;
};

export function AdminCertificateTemplateModal({
  mode,
  template,
  saving,
  error,
  onClose,
  onSave,
}: AdminCertificateTemplateModalProps) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("Certificate of Recognition");
  const [isActive, setIsActive] = useState(true);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null,
  );
  const [layoutKey, setLayoutKey] = useState<string | null>(null);
  const [overlayPositions, setOverlayPositions] = useState<
    OverlayFieldOverride[] | null
  >(null);
  const [selectedField, setSelectedField] =
    useState<CertificateOverlayField | null>(null);
  const [autoRule, setAutoRule] = useState("manual_only");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && template) {
      setName(template.name);
      setDescription(template.description ?? template.displayDescription);
      setTitle(template.title);
      setIsActive(template.isActive);
      setBackgroundImageUrl(template.backgroundImageUrl);
      setLayoutKey(template.layoutKey ?? template.slug);
      setOverlayPositions(
        (template.overlayPositions as OverlayFieldOverride[] | null) ?? null,
      );
      setAutoRule(template.autoRule || "manual_only");
      setSelectedField(null);
    } else {
      setName("");
      setDescription("");
      setTitle("Certificate of Recognition");
      setIsActive(true);
      setBackgroundImageUrl(null);
      setLayoutKey(null);
      setOverlayPositions(null);
      setAutoRule("manual_only");
      setSelectedField(null);
    }
    setUploadError(null);
  }, [mode, template]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving && !uploading) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving, uploading]);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("name", name || file.name);
      const res = await fetch("/api/admin/certificate-templates/upload", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        url?: string;
        layoutKey?: string;
        error?: string;
      };
      if (!res.ok || !json.url) {
        setUploadError(json.error ?? "Upload failed.");
        return;
      }
      setBackgroundImageUrl(json.url);
      setLayoutKey(json.layoutKey ?? "custom");
      setOverlayPositions(null);
    } catch {
      setUploadError("Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const resolvedLayoutKey =
    layoutKey ?? (backgroundImageUrl ? "custom" : null);
  const previewLayout = useMemo(
    () => getCertificateLayout(resolvedLayoutKey),
    [resolvedLayoutKey],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!backgroundImageUrl || !previewLayout) {
      setUploadError("Upload a fillable certificate image before saving.");
      return;
    }

    // Persist exactly what the preview shows (effective fields + typography).
    const positions = getEffectiveFieldOverrides(previewLayout, overlayPositions);

    onSave({
      name,
      description,
      title,
      bodyTemplate: DEFAULT_CERTIFICATE_BODY,
      isActive,
      backgroundImageUrl,
      layoutKey: resolvedLayoutKey,
      overlayPositions: positions,
      autoRule,
    });
  }

  const busy = saving || uploading;
  const canSave = Boolean(backgroundImageUrl && name.trim() && title.trim());

  return (
    <DashboardModalPortal>
      <div
        className="admin-cert-builder-backdrop"
        role="presentation"
        onClick={() => {
          if (!busy) onClose();
        }}
      >
        <div
          className="admin-cert-builder admin-cert-builder--png"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="admin-cert-builder-head">
            <div>
              <p className="admin-cert-builder-eyebrow">Certificate Builder</p>
              <h2 id={titleId} className="admin-cert-builder-title">
                {mode === "create"
                  ? "New custom certificate"
                  : "Edit certificate template"}
              </h2>
            </div>
            <button
              type="button"
              className="admin-cert-builder-close"
              onClick={onClose}
              disabled={busy}
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          <form className="admin-cert-builder-form" onSubmit={handleSubmit}>
            <div className="admin-cert-builder-grid">
              <div className="admin-cert-builder-fields">
                {error ? (
                  <p
                    className="admin-certificates-banner admin-certificates-banner--error"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <section className="admin-cert-builder-section">
                  <p className="admin-cert-builder-section-title">Artwork</p>
                  <p className="admin-cert-builder-hint">
                    Upload the blank fillable PNG. What you see in the preview is
                    what pilots download.
                  </p>
                  <div className="admin-cert-upload-row">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      id="cert-bg-upload"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleUpload(file);
                      }}
                    />
                    <label
                      htmlFor="cert-bg-upload"
                      className="admin-certificates-btn-gold admin-cert-upload-btn"
                    >
                      {uploading
                        ? "Uploading…"
                        : backgroundImageUrl
                          ? "Replace image"
                          : "Upload certificate image"}
                    </label>
                    {backgroundImageUrl ? (
                      <button
                        type="button"
                        className="admin-certificates-btn-ghost"
                        onClick={() => {
                          setBackgroundImageUrl(null);
                          setLayoutKey(null);
                          setOverlayPositions(null);
                        }}
                        disabled={busy}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  {uploadError ? (
                    <p
                      className="admin-certificates-banner admin-certificates-banner--error"
                      role="alert"
                    >
                      {uploadError}
                    </p>
                  ) : null}
                </section>

                {backgroundImageUrl && previewLayout ? (
                  <>
                    <section className="admin-cert-builder-section">
                      <p className="admin-cert-builder-section-title">Fields</p>
                      <div className="admin-cert-field-checklist">
                        {ALL_OVERLAY_FIELDS.map((field) => {
                          const checked =
                            overlayPositions?.some((o) => o.field === field) ||
                            (!overlayPositions &&
                              previewLayout.fields.some((f) => f.field === field));
                          return (
                            <label
                              key={field}
                              className="admin-certificates-check-row"
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(checked)}
                                disabled={busy}
                                onChange={(event) => {
                                  const current =
                                    overlayPositions ??
                                    getEffectiveFieldOverrides(previewLayout, null);
                                  const active = current.map((o) => o.field);
                                  const nextFields = event.target.checked
                                    ? [...new Set([...active, field])]
                                    : active.filter((f) => f !== field);
                                  if (!nextFields.length) return;
                                  setOverlayPositions(
                                    setActiveOverlayFields(
                                      previewLayout,
                                      current,
                                      nextFields as CertificateOverlayField[],
                                    ),
                                  );
                                }}
                              />
                              {OVERLAY_FIELD_LABELS[field]}
                            </label>
                          );
                        })}
                      </div>
                    </section>

                    <CertificateOverlayFieldEditor
                      layout={previewLayout}
                      overrides={overlayPositions}
                      selectedField={selectedField}
                      onSelectField={setSelectedField}
                      onChange={setOverlayPositions}
                      disabled={busy}
                    />
                  </>
                ) : null}

                <section className="admin-cert-builder-section">
                  <p className="admin-cert-builder-section-title">Details</p>
                  <div className="admin-certificates-field">
                    <label htmlFor="cert-tpl-name">Template name</label>
                    <input
                      id="cert-tpl-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Senior Aviator Wings"
                      required
                    />
                  </div>
                  <div className="admin-certificates-field">
                    <label htmlFor="cert-tpl-title">Certificate title</label>
                    <input
                      id="cert-tpl-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Certificate of Promotion"
                      required
                    />
                  </div>
                  <div className="admin-certificates-field">
                    <label htmlFor="cert-tpl-desc">Short description</label>
                    <textarea
                      id="cert-tpl-desc"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={2}
                      placeholder="When this certificate is awarded."
                    />
                  </div>
                  <div className="admin-certificates-field">
                    <label htmlFor="cert-tpl-autorule">Assign mode</label>
                    <select
                      id="cert-tpl-autorule"
                      value={autoRule}
                      onChange={(event) => setAutoRule(event.target.value)}
                      disabled={busy}
                    >
                      <option value="manual_only">Manual award only</option>
                      {CERTIFICATE_CONDITION_CATALOG.filter((c) => c.selectable).map(
                        (c) => (
                          <option key={c.rule} value={c.rule}>
                            {c.label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <p className="admin-cert-builder-hint">
                    {CERTIFICATE_CONDITION_CATALOG.find((c) => c.rule === autoRule)
                      ?.description ??
                      "Admin issues this certificate manually."}
                  </p>
                  {mode === "edit" ? (
                    <label className="admin-certificates-check-row">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(event) => setIsActive(event.target.checked)}
                      />
                      Active (available for issue)
                    </label>
                  ) : null}
                </section>
              </div>

              <aside
                className="admin-cert-builder-preview"
                aria-label="Certificate preview"
              >
                <div className="admin-certificates-preview-head">
                  <div>
                    <p className="admin-certificates-preview-label">
                      ISSUED PREVIEW
                    </p>
                    <p className="admin-certificates-preview-sub">
                      {name.trim() || "Untitled certificate"}
                    </p>
                  </div>
                  {backgroundImageUrl && overlayPositions?.length ? (
                    <button
                      type="button"
                      className="admin-certificates-btn-ghost"
                      onClick={() => setOverlayPositions(null)}
                      disabled={busy}
                    >
                      Reset layout
                    </button>
                  ) : null}
                </div>

                <div className="admin-certificates-preview-canvas-wrap admin-certificates-preview-canvas-wrap--paper">
                  <CertificateCanvas
                    backgroundImageUrl={backgroundImageUrl}
                    layoutKey={resolvedLayoutKey}
                    overlayPositions={overlayPositions}
                    editable={Boolean(backgroundImageUrl)}
                    selectedField={selectedField}
                    onFieldSelect={setSelectedField}
                    onOverlayPositionsChange={setOverlayPositions}
                    gradeOrTitle={template?.previewGrade ?? "First Officer"}
                    memberName="Jonathan Doe"
                    memberNumber="29083"
                    certificateNumber="DPM-2026-000075"
                    issuedAt={new Date("2026-01-01")}
                  />
                </div>

                <p className="admin-cert-builder-hint">
                  Drag fields on the artwork. Font size and position here match the
                  downloaded PDF.
                </p>
              </aside>
            </div>

            <footer className="admin-cert-builder-foot">
              <button
                type="button"
                className="admin-certificates-btn-ghost"
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-certificates-btn-gold"
                disabled={busy || !canSave}
              >
                {saving
                  ? "Saving…"
                  : mode === "create"
                    ? "Create certificate"
                    : "Save template"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </DashboardModalPortal>
  );
}
