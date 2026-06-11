"use client";

import { useEffect, useState } from "react";
import { DEFAULT_CERTIFICATE_BODY } from "@/lib/admin/certificate-display";
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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSave({ name, description, title, bodyTemplate, isActive });
  }

  return (
    <div
      className="admin-certificates-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-certificates-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-certificate-template-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-certificates-modal-head">
          <h2 id="admin-certificate-template-title" className="admin-certificates-modal-title">
            {mode === "create" ? "New Template" : "Edit Template"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-certificates-modal-body">
            {error ? (
              <p className="admin-certificates-banner admin-certificates-banner--error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="admin-certificates-field">
              <label htmlFor="cert-tpl-name">Template name</label>
              <input
                id="cert-tpl-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="admin-certificates-field">
              <label htmlFor="cert-tpl-title">Certificate title (PDF)</label>
              <input
                id="cert-tpl-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="admin-certificates-field">
              <label htmlFor="cert-tpl-desc">Description</label>
              <input
                id="cert-tpl-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="admin-certificates-field">
              <label htmlFor="cert-tpl-body">Body template</label>
              <textarea
                id="cert-tpl-body"
                value={bodyTemplate}
                onChange={(event) => setBodyTemplate(event.target.value)}
                required
                rows={6}
              />
            </div>
            {mode === "edit" ? (
              <label className="admin-certificates-check-row">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
                Active template
              </label>
            ) : null}
            <p className="admin-certificates-banner admin-certificates-banner--info">
              Automated trigger rules, email delivery, and QR verification routes are
              pending — templates persist to the database; PDFs generate on manual issue.
            </p>
          </div>

          <div className="admin-certificates-modal-foot">
            <button
              type="button"
              className="admin-certificates-btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="admin-certificates-btn-gold" disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Create Template" : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
