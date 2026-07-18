"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CertificateCanvas } from "@/components/admin/certificates/CertificateCanvas";
import { DashboardModalPortal } from "@/components/ui/DashboardModalPortal";
import {
  DEFAULT_CERTIFICATE_BODY,
  splitCertificateTitleLines,
} from "@/lib/admin/certificate-display";
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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("Certificate of Recognition");
  const [bodyTemplate, setBodyTemplate] = useState(DEFAULT_CERTIFICATE_BODY);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (mode === "edit" && template) {
      setName(template.name);
      setDescription(template.description ?? template.displayDescription);
      setTitle(template.title);
      setBodyTemplate(template.bodyTemplate);
      setIsActive(template.isActive);
    } else {
      setName("");
      setDescription("");
      setTitle("Certificate of Recognition");
      setBodyTemplate(DEFAULT_CERTIFICATE_BODY);
      setIsActive(true);
    }
  }, [mode, template]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave({ name, description, title, bodyTemplate, isActive });
  }

  const previewTitleLines = splitCertificateTitleLines(
    title || "Certificate of Recognition",
  );
  const previewMission = name.trim() || "Remote Air Service milestone";
  const bodyValid = bodyTemplate.trim().length >= 20;

  return (
    <DashboardModalPortal>
      <div
        className="admin-cert-builder-backdrop"
        role="presentation"
        onClick={() => {
          if (!saving) onClose();
        }}
      >
        <div
          className="admin-cert-builder"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="admin-cert-builder-head">
            <div>
              <p className="admin-cert-builder-eyebrow">Certificate Builder</p>
              <h2 id={titleId} className="admin-cert-builder-title">
                {mode === "create" ? "New Template" : "Edit Template"}
              </h2>
            </div>
            <button
              type="button"
              className="admin-cert-builder-close"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          <form className="admin-cert-builder-form" onSubmit={handleSubmit}>
            <div className="admin-cert-builder-grid">
              {/* Left: fields */}
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
                  <p className="admin-cert-builder-section-title">Details</p>
                  <div className="admin-certificates-field">
                    <label htmlFor="cert-tpl-name">Template name (internal)</label>
                    <input
                      id="cert-tpl-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Aviator Wings, Senior"
                      required
                    />
                  </div>
                  <div className="admin-certificates-field">
                    <label htmlFor="cert-tpl-title">
                      Certificate title (shown on the certificate)
                    </label>
                    <input
                      id="cert-tpl-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="e.g. Certificate of Promotion"
                      required
                    />
                    <p className="admin-cert-builder-hint">
                      Rendered as: {previewTitleLines.join(" / ")}
                    </p>
                  </div>
                  <div className="admin-certificates-field">
                    <label htmlFor="cert-tpl-desc">
                      Short description (list card copy)
                    </label>
                    <textarea
                      id="cert-tpl-desc"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={2}
                      placeholder="Explains when this certificate is awarded."
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
                      rows={7}
                    />
                    <p
                      className={`admin-cert-builder-hint${
                        bodyValid ? "" : " admin-cert-builder-hint--warn"
                      }`}
                    >
                      Use tokens above; they are replaced when a certificate is
                      issued. Minimum 20 characters.
                    </p>
                  </div>
                </section>

                <section className="admin-cert-builder-section">
                  <div className="admin-certificates-wing-hint" role="note">
                    <p className="admin-certificates-wing-hint-title">
                      Badge / wing assignment
                    </p>
                    <p className="admin-certificates-wing-hint-copy">
                      Issuing this certificate re-runs wing evaluation. Create
                      badges with condition{" "}
                      <strong>Has any platform certificate</strong>,{" "}
                      <strong>Platform certificates (count)</strong>, or{" "}
                      <strong>Specific certificate template</strong>
                      {mode === "edit" && template?.slug ? (
                        <>
                          {" "}
                          using slug <code>{template.slug}</code>
                        </>
                      ) : (
                        <> (slug is generated from the template name on create)</>
                      )}
                      .
                    </p>
                  </div>

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
                </section>
              </div>

              {/* Right: live preview */}
              <aside
                className="admin-cert-builder-preview"
                aria-label="Certificate preview"
              >
                <div className="admin-certificates-preview-head">
                  <div>
                    <p className="admin-certificates-preview-label">
                      LIVE PREVIEW
                    </p>
                    <p className="admin-certificates-preview-sub">
                      {name.trim() || "Untitled certificate"}
                    </p>
                  </div>
                </div>

                <div className="admin-certificates-preview-canvas-wrap">
                  <CertificateCanvas
                    titleLines={previewTitleLines}
                    mission={previewMission}
                  />
                </div>

                <div className="admin-certificates-verify-strip">
                  <div className="admin-certificates-verify-copy">
                    <span className="admin-certificates-verify-icon" aria-hidden>
                      ▦
                    </span>
                    <p className="admin-certificates-verify-text">
                      Encrypted blockchain verification active.
                    </p>
                  </div>
                  <span className="admin-certificates-verify-status">
                    STATUS: AUTHENTICATED
                  </span>
                </div>

                <p className="admin-certificates-banner admin-certificates-banner--info">
                  Automated trigger rules, email delivery, and QR verification
                  routes are pending — templates persist to the database; PDFs
                  generate on manual issue.
                </p>
              </aside>
            </div>

            <footer className="admin-cert-builder-foot">
              <button
                type="button"
                className="admin-certificates-btn-ghost"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-certificates-btn-gold"
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : mode === "create"
                    ? "Create Template"
                    : "Save Template"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </DashboardModalPortal>
  );
}
