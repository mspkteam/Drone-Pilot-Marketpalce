"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCertificateLivePreview } from "@/components/admin/certificates/AdminCertificateLivePreview";
import { AdminCertificateTemplateCard } from "@/components/admin/certificates/AdminCertificateTemplateCard";
import { AdminCertificateTemplateModal } from "@/components/admin/certificates/AdminCertificateTemplateModal";
import type {
  AdminCertificateEngineDataDto,
  AdminCertificateTemplateCardDto,
  CertificateTemplateFormInput,
} from "@/types/admin-certificates";
import type { AdminPilotCertificateDto } from "@/types/certificate";

function isPositiveGrowth(subtext: string): boolean {
  return subtext.trim().startsWith("+");
}

type AdminCertificateEnginePortalProps = {
  canManageTemplates: boolean;
};

export function AdminCertificateEnginePortal({
  canManageTemplates,
}: AdminCertificateEnginePortalProps) {
  const [data, setData] = useState<AdminCertificateEngineDataDto | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingTemplate, setEditingTemplate] =
    useState<AdminCertificateTemplateCardDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [issuePilotId, setIssuePilotId] = useState("");
  const [issueTemplateId, setIssueTemplateId] = useState("");
  const [issueNotes, setIssueNotes] = useState("");
  const [issueGrade, setIssueGrade] = useState("");
  const [issuing, setIssuing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/certificate-engine");
      const json = (await res.json()) as AdminCertificateEngineDataDto & {
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load certificate engine.");
        setData(null);
      } else {
        setData(json);
        setSelectedId((current) => current ?? json.templates[0]?.id ?? null);
        setIssueTemplateId((current) => {
          if (current) return current;
          const active = json.templates.find((t) => t.isActive && !t.isMock);
          return active?.id ?? "";
        });
      }
    } catch {
      setError("Failed to load certificate engine.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const templates = data?.templates ?? [];
  const selectedTemplate =
    templates.find((template) => template.id === selectedId) ?? templates[0] ?? null;

  async function readApiError(res: Response): Promise<string> {
    const text = await res.text();
    if (!text) return `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text) as { error?: string };
      return json.error ?? `Request failed (${res.status})`;
    } catch {
      return text.slice(0, 240) || `Request failed (${res.status})`;
    }
  }

  async function handleSaveTemplate(input: CertificateTemplateFormInput) {
    if (!canManageTemplates) return;
    if (modalMode === "edit" && editingTemplate?.isMock) {
      setModalError("Sample templates are preview-only until real templates exist in the database.");
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      if (modalMode === "create") {
        const res = await fetch("/api/admin/certificate-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: input.name,
            description: input.description || null,
            title: input.title,
            bodyTemplate: input.bodyTemplate,
            backgroundImageUrl: input.backgroundImageUrl ?? null,
            layoutKey: input.layoutKey ?? null,
            overlayPositions: input.overlayPositions ?? null,
            autoRule: input.autoRule ?? "manual_only",
          }),
        });
        if (!res.ok) {
          setModalError(await readApiError(res));
          return;
        }
        const json = (await res.json()) as { template?: { id?: string } };
        setSuccess("Template created.");
        setModalMode(null);
        await load();
        if (json.template?.id) setSelectedId(json.template.id);
      } else if (modalMode === "edit" && editingTemplate) {
        const res = await fetch(
          `/api/admin/certificate-templates/${editingTemplate.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: input.name,
              description: input.description || null,
              title: input.title,
              bodyTemplate: input.bodyTemplate,
              isActive: input.isActive,
              backgroundImageUrl: input.backgroundImageUrl ?? null,
              layoutKey: input.layoutKey ?? null,
              overlayPositions: input.overlayPositions ?? null,
              autoRule: input.autoRule ?? "manual_only",
            }),
          },
        );
        if (!res.ok) {
          setModalError(await readApiError(res));
          return;
        }
        setSuccess("Template updated.");
        setModalMode(null);
        setEditingTemplate(null);
        await load();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Save failed.";
      setModalError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleIssueCertificate(event: React.FormEvent) {
    event.preventDefault();
    if (!issuePilotId || !issueTemplateId) return;

    setIssuing(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotProfileId: issuePilotId,
          templateId: issueTemplateId,
          notes: issueNotes || null,
          awardGrade: issueGrade || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Issue failed.");
        return;
      }
      setSuccess(
        `Issued ${json.certificate.certificateNumber} to ${json.certificate.pilotDisplayName}.`,
      );
      setIssueNotes("");
      setIssueGrade("");
      await load();
    } catch {
      setError("Issue failed.");
    } finally {
      setIssuing(false);
    }
  }

  const stats = data?.stats;
  const realTemplates = templates.filter((template) => !template.isMock);
  const issueTemplate =
    realTemplates.find((t) => t.id === issueTemplateId) ?? null;
  const issueNeedsGrade = Boolean(issueTemplate?.requiresGrade);

  return (
    <div className="admin-certificates-page">
      <section
        className="admin-certificates-hero admin-ops-bracket-card"
        aria-label="Automated certificates"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-certificates-hero-inner">
          <div className="admin-certificates-hero-copy">
            <p className="admin-ops-eyebrow">CERTIFICATE &amp; PROMOTION ENGINE</p>
            <h1 className="admin-certificates-hero-title">
              Remote Air Service Certificates
            </h1>
            <p className="admin-certificates-hero-desc">
              Digital certificates are issued free when earned and tied to member
              promotions, aviation wings, and verified Remote Air Service
              milestones.
            </p>
          </div>
          {canManageTemplates ? (
            <button
              type="button"
              className="admin-certificates-btn-gold"
              onClick={() => {
                setModalError(null);
                setEditingTemplate(null);
                setModalMode("create");
              }}
            >
              NEW CUSTOM CERTIFICATE
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="admin-certificates-banner admin-certificates-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="admin-certificates-banner admin-certificates-banner--info" role="status">
          {success}
        </p>
      ) : null}
      {data?.usingMockTemplates ? (
        <p className="admin-certificates-banner admin-certificates-banner--info" role="status">
          Showing sample templates until certificate templates are created in the database.
          Manual issue and PDF generation use real APIs once templates exist.
        </p>
      ) : null}

      {stats ? (
        <section
          className="admin-certificates-stats-grid"
          aria-label="Certificate statistics"
        >
          <article className="admin-certificates-stat-card">
            <p className="admin-certificates-stat-label">ACTIVE TEMPLATES</p>
            <p className="admin-certificates-stat-value">
              {stats.activeTemplates.toLocaleString()}
            </p>
            <p className="admin-certificates-stat-sub">
              {stats.activeTemplatesSubtext}
            </p>
          </article>
          <article className="admin-certificates-stat-card">
            <p className="admin-certificates-stat-label">TOTAL ISSUED</p>
            <p className="admin-certificates-stat-value">
              {stats.totalIssued.toLocaleString()}
            </p>
            <p className="admin-certificates-stat-sub">
              {stats.totalIssuedSubtext}
            </p>
          </article>
          <article className="admin-certificates-stat-card">
            <p className="admin-certificates-stat-label">ISSUED (30D)</p>
            <p className="admin-certificates-stat-value">
              {stats.issued30d.toLocaleString()}
            </p>
            <p
              className={`admin-certificates-stat-sub${
                isPositiveGrowth(stats.issued30dSubtext)
                  ? " admin-certificates-stat-sub--success"
                  : ""
              }`}
            >
              {stats.issued30dSubtext}
            </p>
          </article>
          <article className="admin-certificates-stat-card">
            <p className="admin-certificates-stat-label">PILOTS RECOGNIZED</p>
            <p className="admin-certificates-stat-value">
              {stats.recipients.toLocaleString()}
            </p>
            <p className="admin-certificates-stat-sub">
              {stats.recipientsSubtext}
            </p>
          </article>
        </section>
      ) : null}

      {loading ? (
        <p className="admin-certificates-loading">Loading certificate engine…</p>
      ) : selectedTemplate ? (
        <div className="admin-certificates-main">
          <div className="admin-certificates-template-list">
            {templates.map((template) => (
              <AdminCertificateTemplateCard
                key={template.id}
                template={template}
                selected={template.id === selectedTemplate.id}
                canEdit={canManageTemplates && !template.isMock}
                onSelect={() => setSelectedId(template.id)}
                onPreview={() => setSelectedId(template.id)}
                onEdit={() => {
                  setEditingTemplate(template);
                  setModalError(null);
                  setModalMode("edit");
                }}
              />
            ))}
          </div>
          <AdminCertificateLivePreview template={selectedTemplate} />
        </div>
      ) : null}

      {data && realTemplates.length > 0 ? (
        <section className="admin-certificates-issued-panel" aria-label="Manual issue">
          <h2 className="admin-certificates-issued-title">Manual issue</h2>
          <p className="admin-certificates-issued-sub">
            Issue a signed PDF to an approved pilot using an active template (real PDF
            generation).
          </p>
          <form className="admin-certificates-issue-form" onSubmit={handleIssueCertificate}>
            <div className="admin-certificates-field">
              <label htmlFor="issue-pilot">Pilot</label>
              <select
                id="issue-pilot"
                value={issuePilotId}
                onChange={(event) => setIssuePilotId(event.target.value)}
                required
              >
                <option value="">Select pilot…</option>
                {data.pilots.map((pilot) => (
                  <option key={pilot.id} value={pilot.id}>
                    {pilot.displayName} ({pilot.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-certificates-field">
              <label htmlFor="issue-template">Template</label>
              <select
                id="issue-template"
                value={issueTemplateId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setIssueTemplateId(nextId);
                  const next = realTemplates.find((t) => t.id === nextId);
                  if (next?.requiresGrade && next.previewGrade) {
                    setIssueGrade(next.previewGrade);
                  } else {
                    setIssueGrade("");
                  }
                }}
                required
              >
                <option value="">Select template…</option>
                {realTemplates
                  .filter((template) => template.isActive)
                  .map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
              </select>
            </div>
            {issueNeedsGrade ? (
              <div className="admin-certificates-field">
                <label htmlFor="issue-grade">Grade / Rank</label>
                <input
                  id="issue-grade"
                  value={issueGrade}
                  onChange={(event) => setIssueGrade(event.target.value)}
                  placeholder={
                    issueTemplate?.slug === "captain-promotion"
                      ? "CAPTAIN"
                      : "e.g. First Officer"
                  }
                  required
                />
              </div>
            ) : null}
            <div className="admin-certificates-field">
              <label htmlFor="issue-notes">Notes (optional)</label>
              <input
                id="issue-notes"
                value={issueNotes}
                onChange={(event) => setIssueNotes(event.target.value)}
              />
            </div>
            <button type="submit" className="admin-certificates-btn-gold" disabled={issuing}>
              {issuing ? "Issuing…" : "Issue & Generate PDF"}
            </button>
          </form>
        </section>
      ) : null}

      {data && data.certificates.length > 0 ? (
        <section className="admin-certificates-issued-panel" aria-label="Issued certificates">
          <h2 className="admin-certificates-issued-title">Issued certificates</h2>
          <p className="admin-certificates-issued-sub">
            Audit trail of platform-issued pilot certificates.
          </p>
          <ul className="admin-certificates-issued-list">
            {data.certificates.map((certificate: AdminPilotCertificateDto) => (
              <li key={certificate.id} className="admin-certificates-issued-row">
                <div>
                  <p className="admin-certificates-issued-name">
                    {certificate.pilotDisplayName} · {certificate.templateName}
                  </p>
                  <p className="admin-certificates-issued-meta">
                    {certificate.certificateNumber} ·{" "}
                    {new Date(certificate.issuedAt).toLocaleString()}
                  </p>
                </div>
                <a
                  className="admin-certificates-link"
                  href={`/api/admin/certificates/${certificate.id}/download`}
                >
                  Download PDF
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {modalMode ? (
        <AdminCertificateTemplateModal
          mode={modalMode}
          template={modalMode === "edit" ? editingTemplate : null}
          saving={saving}
          error={modalError}
          onClose={() => {
            if (!saving) {
              setModalMode(null);
              setEditingTemplate(null);
              setModalError(null);
            }
          }}
          onSave={handleSaveTemplate}
        />
      ) : null}
    </div>
  );
}
