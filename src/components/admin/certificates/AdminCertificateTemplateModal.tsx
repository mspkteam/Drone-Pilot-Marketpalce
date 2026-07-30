"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CertificateCanvas } from "@/components/admin/certificates/CertificateCanvas";
import { CertificateOverlayFieldEditor } from "@/components/admin/certificates/CertificateOverlayFieldEditor";
import { DashboardModalPortal } from "@/components/ui/DashboardModalPortal";
import { DEFAULT_CERTIFICATE_BODY } from "@/lib/admin/certificate-display";
import { CERTIFICATE_CONDITION_CATALOG } from "@/lib/certificates/conditions";
import {
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

const COMMON_FIELDS: CertificateOverlayField[] = [
  "pilotName",
  "gradeOrTitle",
  "memberNumber",
  "certificateNumber",
  "issuedAt",
];

const ADVANCED_FIELDS: CertificateOverlayField[] = [
  "awardDateShort",
  "day",
  "month",
  "year",
];

const FIELD_PRESETS: Array<{
  id: string;
  label: string;
  hint: string;
  fields: CertificateOverlayField[];
}> = [
  {
    id: "name-cert",
    label: "Name + cert #",
    hint: "Simple recognition certificates",
    fields: ["pilotName", "certificateNumber"],
  },
  {
    id: "promotion",
    label: "Promotion",
    hint: "Name, grade, and certificate number",
    fields: ["pilotName", "gradeOrTitle", "certificateNumber"],
  },
  {
    id: "wings",
    label: "Wings award",
    hint: "Name, member # + date, certificate number",
    fields: ["pilotName", "memberNumber", "certificateNumber"],
  },
  {
    id: "captain",
    label: "Captain date parts",
    hint: "Name, rank, and day / month / year blanks",
    fields: ["pilotName", "gradeOrTitle", "day", "month", "year"],
  },
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
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

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
      const advancedOn = ADVANCED_FIELDS.some((field) =>
        (template.overlayPositions as OverlayFieldOverride[] | null)?.some(
          (o) => o.field === field,
        ),
      );
      setShowAdvancedFields(advancedOn);
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
      setShowAdvancedFields(false);
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
      // Keep the template's layout family when replacing artwork so field
      // defaults stay aligned; only brand-new uploads use "custom".
      setLayoutKey((prev) => prev ?? json.layoutKey ?? "custom");
      setSelectedField("pilotName");
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

  const activeFields = useMemo(() => {
    if (!previewLayout) return [] as CertificateOverlayField[];
    const effective = getEffectiveFieldOverrides(previewLayout, overlayPositions);
    return effective.map((f) => f.field);
  }, [previewLayout, overlayPositions]);

  function applyFieldSet(fields: CertificateOverlayField[]) {
    if (!previewLayout) return;
    const current =
      overlayPositions ?? getEffectiveFieldOverrides(previewLayout, null);
    const next = setActiveOverlayFields(previewLayout, current, fields);
    setOverlayPositions(next);
    setSelectedField(fields[0] ?? null);
    if (fields.some((f) => ADVANCED_FIELDS.includes(f))) {
      setShowAdvancedFields(true);
    }
  }

  function toggleField(field: CertificateOverlayField, checked: boolean) {
    if (!previewLayout) return;
    const current =
      overlayPositions ?? getEffectiveFieldOverrides(previewLayout, null);
    const active = current.map((o) => o.field);
    const nextFields = checked
      ? [...new Set([...active, field])]
      : active.filter((f) => f !== field);
    if (!nextFields.length) return;
    setOverlayPositions(
      setActiveOverlayFields(previewLayout, current, nextFields),
    );
    if (checked) setSelectedField(field);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!backgroundImageUrl || !previewLayout) {
      setUploadError("Upload a fillable certificate image before saving.");
      return;
    }

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

  const canvasProps = {
    backgroundImageUrl,
    layoutKey: resolvedLayoutKey,
    overlayPositions,
    editable: Boolean(backgroundImageUrl),
    selectedField,
    onFieldSelect: setSelectedField,
    onOverlayPositionsChange: setOverlayPositions,
    gradeOrTitle: template?.previewGrade ?? "First Officer",
    memberName: "Jonathan Doe",
    memberNumber: "001000",
    certificateNumber: "DPM-2026-000001",
    issuedAt: new Date("2026-01-01"),
  } as const;

  return (
    <DashboardModalPortal>
      <form
        className="admin-cert-studio"
        onSubmit={handleSubmit}
        aria-labelledby={titleId}
      >
        <header className="admin-cert-studio-head">
          <div className="admin-cert-studio-titleblock">
            <p className="admin-cert-studio-eyebrow">Certificate studio</p>
            <h2 id={titleId} className="admin-cert-studio-title">
              {mode === "create"
                ? "New custom certificate"
                : name.trim() || "Edit certificate template"}
            </h2>
            <p className="admin-cert-studio-meta">
              {backgroundImageUrl
                ? selectedField
                  ? `Editing ${OVERLAY_FIELD_LABELS[selectedField]} · drag on certificate · Shift = fine move`
                  : "Select a field, drag it on the certificate, then save"
                : "Upload fillable artwork to start placing fields"}
              <span aria-hidden>·</span>
              PDF matches this layout
            </p>
          </div>
          <div className="admin-cert-studio-actions">
            {backgroundImageUrl ? (
              <button
                type="button"
                className="admin-certificates-btn-ghost"
                onClick={() => {
                  setOverlayPositions(null);
                  setSelectedField("pilotName");
                }}
                disabled={busy}
              >
                Reset layout
              </button>
            ) : null}
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
              title={
                !backgroundImageUrl
                  ? "Upload artwork first"
                  : !name.trim()
                    ? "Enter a template name"
                    : undefined
              }
            >
              {saving
                ? "Saving…"
                : mode === "create"
                  ? "Create certificate"
                  : "Save template"}
            </button>
          </div>
        </header>

        <div className="admin-cert-studio-body">
          <aside className="admin-cert-studio-rail" aria-label="Template settings">
            {error ? (
              <p
                className="admin-certificates-banner admin-certificates-banner--error"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <section className="admin-cert-studio-block">
              <p className="admin-cert-studio-block-title">Artwork</p>
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
                      setSelectedField(null);
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
              <section className="admin-cert-studio-block">
                <p className="admin-cert-studio-block-title">Fields to print</p>
                <div className="admin-cert-presets admin-cert-presets--compact">
                  {FIELD_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="admin-cert-preset-card"
                      disabled={busy}
                      onClick={() => applyFieldSet(preset.fields)}
                      title={preset.hint}
                    >
                      <strong>{preset.label}</strong>
                      <span>{preset.hint}</span>
                    </button>
                  ))}
                </div>

                <div className="admin-cert-field-checklist">
                  {COMMON_FIELDS.map((field) => (
                    <label
                      key={field}
                      className={`admin-certificates-check-row${
                        activeFields.includes(field)
                          ? " admin-certificates-check-row--on"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={activeFields.includes(field)}
                        disabled={busy}
                        onChange={(event) =>
                          toggleField(field, event.target.checked)
                        }
                      />
                      {OVERLAY_FIELD_LABELS[field]}
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  className="admin-cert-advanced-toggle"
                  onClick={() => setShowAdvancedFields((value) => !value)}
                >
                  {showAdvancedFields
                    ? "Hide date-part fields"
                    : "Show day / month / year fields"}
                </button>

                {showAdvancedFields ? (
                  <div className="admin-cert-field-checklist">
                    {ADVANCED_FIELDS.map((field) => (
                      <label
                        key={field}
                        className="admin-certificates-check-row"
                      >
                        <input
                          type="checkbox"
                          checked={activeFields.includes(field)}
                          disabled={busy}
                          onChange={(event) =>
                            toggleField(field, event.target.checked)
                          }
                        />
                        {OVERLAY_FIELD_LABELS[field]}
                      </label>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {backgroundImageUrl && previewLayout ? (
              <CertificateOverlayFieldEditor
                layout={previewLayout}
                overrides={overlayPositions}
                selectedField={selectedField}
                onSelectField={setSelectedField}
                onChange={setOverlayPositions}
                disabled={busy}
                variant="rail"
              />
            ) : null}

            <section className="admin-cert-studio-block">
              <p className="admin-cert-studio-block-title">Template details</p>
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
          </aside>

          <div className="admin-cert-studio-stage">
            <div className="admin-cert-studio-canvas-wrap">
              {backgroundImageUrl ? (
                <CertificateCanvas {...canvasProps} />
              ) : (
                <div className="admin-cert-studio-empty">
                  <p className="admin-cert-studio-empty-title">
                    Upload fillable artwork
                  </p>
                  <p className="admin-cert-studio-empty-copy">
                    Use the blank certificate PNG. Field placement here is exactly
                    what pilots download as PDF.
                  </p>
                  <label
                    htmlFor="cert-bg-upload"
                    className="admin-certificates-btn-gold admin-cert-upload-btn"
                  >
                    {uploading ? "Uploading…" : "Upload certificate image"}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </DashboardModalPortal>
  );
}
