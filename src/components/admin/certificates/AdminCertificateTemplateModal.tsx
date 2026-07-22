"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CertificateCanvas } from "@/components/admin/certificates/CertificateCanvas";
import { CertificateOverlayFieldEditor } from "@/components/admin/certificates/CertificateOverlayFieldEditor";
import { DashboardModalPortal } from "@/components/ui/DashboardModalPortal";
import {
  DEFAULT_CERTIFICATE_BODY,
  splitCertificateTitleLines,
} from "@/lib/admin/certificate-display";
import {
  getCertificateLayout,
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

const BODY_TOKENS: Array<{ token: string; label: string }> = [
  { token: "{{pilotName}}", label: "Pilot name" },
  { token: "{{licenseNumber}}", label: "License #" },
  { token: "{{gradeOrTitle}}", label: "Grade / rank" },
  { token: "{{templateName}}", label: "Template name" },
  { token: "{{certificateNumber}}", label: "Certificate #" },
  { token: "{{issueDate}}", label: "Issue date" },
];

export function AdminCertificateTemplateModal({
  mode,
  template,
  saving,
  error,
  onClose,
  onSave,
}: AdminCertificateTemplateModalProps) {
  const titleId = useId();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("Certificate of Recognition");
  const [bodyTemplate, setBodyTemplate] = useState(DEFAULT_CERTIFICATE_BODY);
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && template) {
      setName(template.name);
      setDescription(template.description ?? template.displayDescription);
      setTitle(template.title);
      setBodyTemplate(template.bodyTemplate);
      setIsActive(template.isActive);
      setBackgroundImageUrl(template.backgroundImageUrl);
      setLayoutKey(template.layoutKey ?? template.slug);
      setOverlayPositions(
        (template.overlayPositions as OverlayFieldOverride[] | null) ?? null,
      );
      setSelectedField(null);
    } else {
      setName("");
      setDescription("");
      setTitle("Certificate of Recognition");
      setBodyTemplate(DEFAULT_CERTIFICATE_BODY);
      setIsActive(true);
      setBackgroundImageUrl(null);
      setLayoutKey(null);
      setOverlayPositions(null);
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

  function insertToken(token: string) {
    const el = bodyRef.current;
    if (!el) {
      setBodyTemplate((current) => `${current}${token}`);
      return;
    }
    const start = el.selectionStart ?? bodyTemplate.length;
    const end = el.selectionEnd ?? bodyTemplate.length;
    const next = bodyTemplate.slice(0, start) + token + bodyTemplate.slice(end);
    setBodyTemplate(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + token.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave({
      name,
      description,
      title,
      bodyTemplate,
      isActive,
      backgroundImageUrl,
      layoutKey: layoutKey ?? (backgroundImageUrl ? "custom" : null),
      overlayPositions,
    });
  }

  const previewTitleLines = splitCertificateTitleLines(
    title || "Certificate of Recognition",
  );
  const previewMission = name.trim() || "Remote Air Service milestone";
  const bodyValid = bodyTemplate.trim().length >= 20;
  const busy = saving || uploading;
  const resolvedLayoutKey =
    layoutKey ?? (backgroundImageUrl ? "custom" : null);
  const previewLayout = useMemo(
    () => getCertificateLayout(resolvedLayoutKey),
    [resolvedLayoutKey],
  );

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
                  <p className="admin-cert-builder-section-title">
                    Certificate artwork
                  </p>
                  <p className="admin-cert-builder-hint">
                    Upload the official RAS fillable PNG (or your own blank
                    certificate). Drag name, grade, date, and number on the
                    preview to align them with the artwork.
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
                  {backgroundImageUrl ? (
                    <p className="admin-cert-builder-hint">
                      Artwork: <code>{backgroundImageUrl}</code>
                    </p>
                  ) : (
                    <p className="admin-cert-builder-hint admin-cert-builder-hint--warn">
                      Without an uploaded image, the builder uses the legacy
                      text layout. Upload a PNG to match the official RAS look.
                    </p>
                  )}
                </section>

                {backgroundImageUrl && previewLayout ? (
                  <CertificateOverlayFieldEditor
                    layout={previewLayout}
                    overrides={overlayPositions}
                    selectedField={selectedField}
                    onSelectField={setSelectedField}
                    onChange={setOverlayPositions}
                    disabled={busy}
                  />
                ) : null}

                <section className="admin-cert-builder-section">
                  <p className="admin-cert-builder-section-title">Details</p>
                  <div className="admin-certificates-field">
                    <label htmlFor="cert-tpl-name">Template name (internal)</label>
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
                </section>

                <section className="admin-cert-builder-section">
                  <p className="admin-cert-builder-section-title">
                    PDF body template
                  </p>
                  <div className="admin-cert-builder-tokens">
                    {BODY_TOKENS.map((t) => (
                      <button
                        key={t.token}
                        type="button"
                        className="admin-cert-builder-token"
                        onClick={() => insertToken(t.token)}
                        title={`Insert ${t.token}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="admin-certificates-field">
                    <textarea
                      id="cert-tpl-body"
                      ref={bodyRef}
                      value={bodyTemplate}
                      onChange={(event) => setBodyTemplate(event.target.value)}
                      required
                      rows={6}
                    />
                    <p
                      className={`admin-cert-builder-hint${
                        bodyValid ? "" : " admin-cert-builder-hint--warn"
                      }`}
                    >
                      Tokens are replaced on issue. Minimum 20 characters.
                    </p>
                  </div>
                </section>

                {mode === "edit" ? (
                  <label className="admin-certificates-check-row">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(event) => setIsActive(event.target.checked)}
                    />
                    Active template (visible for manual issue)
                  </label>
                ) : null}
              </div>

              <aside
                className="admin-cert-builder-preview"
                aria-label="Certificate preview"
              >
                <div className="admin-certificates-preview-head">
                  <div>
                    <p className="admin-certificates-preview-label">
                      LIVE PREVIEW — DRAG TO ALIGN
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
                      Reset positions
                    </button>
                  ) : null}
                </div>

                <div className="admin-certificates-preview-canvas-wrap admin-certificates-preview-canvas-wrap--paper">
                  <CertificateCanvas
                    titleLines={previewTitleLines}
                    mission={previewMission}
                    backgroundImageUrl={backgroundImageUrl}
                    layoutKey={
                      layoutKey ?? (backgroundImageUrl ? "custom" : null)
                    }
                    overlayPositions={overlayPositions}
                    editable={Boolean(backgroundImageUrl)}
                    selectedField={selectedField}
                    onFieldSelect={setSelectedField}
                    onOverlayPositionsChange={setOverlayPositions}
                    gradeOrTitle={template?.previewGrade ?? "First Officer"}
                    memberName="Jonathan Doe"
                    certificateNumber="DPM-2026-000075"
                    issuedAt={new Date("2026-01-01")}
                  />
                </div>

                <p className="admin-cert-builder-hint">
                  Drag fields onto the artwork or use the alignment panel.
                  Center guides snap at 50%. Typography and positions save with
                  the template and apply to issued PDFs.
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
                disabled={busy || !bodyValid}
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
