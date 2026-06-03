"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import type {
  AdminPilotCertificateDto,
  CertificateTemplateDto,
} from "@/types/certificate";

type PilotOption = {
  id: string;
  displayName: string;
  email: string;
  licenseNumber: string;
};

const DEFAULT_BODY = `This certifies that {{pilotName}} (License {{licenseNumber}}) has met the requirements for {{templateName}} on the Drone Pilot Marketplace.

Certificate number: {{certificateNumber}}
Issue date: {{issueDate}}`;

export function AdminCertificatesPanel() {
  const [templates, setTemplates] = useState<CertificateTemplateDto[]>([]);
  const [certificates, setCertificates] = useState<AdminPilotCertificateDto[]>([]);
  const [pilots, setPilots] = useState<PilotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [tplName, setTplName] = useState("");
  const [tplTitle, setTplTitle] = useState("Certificate of Recognition");
  const [tplBody, setTplBody] = useState(DEFAULT_BODY);
  const [tplDesc, setTplDesc] = useState("");
  const [creatingTpl, setCreatingTpl] = useState(false);

  const [issuePilotId, setIssuePilotId] = useState("");
  const [issueTemplateId, setIssueTemplateId] = useState("");
  const [issueNotes, setIssueNotes] = useState("");
  const [issuing, setIssuing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tplRes, certRes] = await Promise.all([
        fetch("/api/admin/certificate-templates"),
        fetch("/api/admin/certificates"),
      ]);
      const tplData = await tplRes.json();
      const certData = await certRes.json();
      if (!tplRes.ok) {
        setError(tplData.error ?? "Failed to load templates.");
        return;
      }
      if (!certRes.ok) {
        setError(certData.error ?? "Failed to load certificates.");
        return;
      }
      setTemplates(tplData.templates ?? []);
      setCertificates(certData.certificates ?? []);
      setPilots(certData.pilots ?? []);
      const active = (tplData.templates as CertificateTemplateDto[]).filter(
        (t) => t.isActive,
      );
      if (active[0] && !issueTemplateId) setIssueTemplateId(active[0].id);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [issueTemplateId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    setCreatingTpl(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/certificate-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tplName,
          title: tplTitle,
          bodyTemplate: tplBody,
          description: tplDesc || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Create failed.");
      } else {
        setSuccess("Template created.");
        setTplName("");
        setTplDesc("");
        await load();
      }
    } catch {
      setError("Create failed.");
    } finally {
      setCreatingTpl(false);
    }
  }

  async function issueCertificate(e: React.FormEvent) {
    e.preventDefault();
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Issue failed.");
      } else {
        setSuccess(
          `Issued ${data.certificate.certificateNumber} to ${data.certificate.pilotDisplayName}.`,
        );
        setIssueNotes("");
        await load();
      }
    } catch {
      setError("Issue failed.");
    } finally {
      setIssuing(false);
    }
  }

  async function toggleTemplate(id: string, isActive: boolean) {
    await fetch(`/api/admin/certificate-templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  }

  return (
    <div className="space-y-10">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-700" role="status">
          {success}
        </p>
      ) : null}

      <section className="rounded-lg border border-border bg-surface-elevated p-5">
        <h2 className="text-lg font-semibold">Create template</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Placeholders: {"{{pilotName}}"}, {"{{licenseNumber}}"}, {"{{certificateNumber}}"}, {"{{issueDate}}"}, {"{{templateName}}"}
        </p>
        <form onSubmit={(e) => void createTemplate(e)} className="mt-4 space-y-4">
          <FormField label="Template name" htmlFor="tpl-name" required>
            <input
              id="tpl-name"
              required
              value={tplName}
              onChange={(e) => setTplName(e.target.value)}
              className={inputClassName}
              placeholder="e.g. Platform Verified Pilot"
            />
          </FormField>
          <FormField label="Certificate title (PDF)" htmlFor="tpl-title" required>
            <input
              id="tpl-title"
              required
              value={tplTitle}
              onChange={(e) => setTplTitle(e.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Description (optional)" htmlFor="tpl-desc">
            <input
              id="tpl-desc"
              value={tplDesc}
              onChange={(e) => setTplDesc(e.target.value)}
              className={inputClassName}
            />
          </FormField>
          <FormField label="Body template" htmlFor="tpl-body" required>
            <textarea
              id="tpl-body"
              required
              rows={6}
              value={tplBody}
              onChange={(e) => setTplBody(e.target.value)}
              className={inputClassName}
            />
          </FormField>
          <Button type="submit" disabled={creatingTpl}>
            {creatingTpl ? "Creating…" : "Create template"}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Templates</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : templates.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No templates yet.</p>
        ) : (
          <ul className="mt-4 list-panel">
            {templates.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {t.name}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({t.slug}) · {t.issuedCount} issued
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">{t.title}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void toggleTemplate(t.id, t.isActive)}
                >
                  {t.isActive ? "Deactivate" : "Activate"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface-elevated p-5">
        <h2 className="text-lg font-semibold">Issue certificate</h2>
        <form onSubmit={(e) => void issueCertificate(e)} className="mt-4 space-y-4">
          <FormField label="Pilot" htmlFor="issue-pilot" required>
            <select
              id="issue-pilot"
              required
              value={issuePilotId}
              onChange={(e) => setIssuePilotId(e.target.value)}
              className={inputClassName}
            >
              <option value="">Select pilot…</option>
              {pilots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.email})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Template" htmlFor="issue-tpl" required>
            <select
              id="issue-tpl"
              required
              value={issueTemplateId}
              onChange={(e) => setIssueTemplateId(e.target.value)}
              className={inputClassName}
            >
              {templates
                .filter((t) => t.isActive)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </FormField>
          <FormField label="Notes (optional)" htmlFor="issue-notes">
            <input
              id="issue-notes"
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              className={inputClassName}
            />
          </FormField>
          <Button type="submit" disabled={issuing || !issuePilotId}>
            {issuing ? "Issuing…" : "Issue & generate PDF"}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Issued certificates</h2>
        {certificates.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">None issued yet.</p>
        ) : (
          <ul className="mt-4 list-panel">
            {certificates.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {c.pilotDisplayName} · {c.templateName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {c.certificateNumber} · {c.pilotEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.issuedAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  href={`/api/admin/certificates/${c.id}/download`}
                  size="sm"
                  variant="ghost"
                >
                  Download PDF
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
