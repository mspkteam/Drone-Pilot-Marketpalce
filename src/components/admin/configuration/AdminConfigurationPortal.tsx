"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminConfigEmailTemplateModal } from "@/components/admin/configuration/AdminConfigEmailTemplateModal";
import { AdminConfigSaveConfirmModal } from "@/components/admin/configuration/AdminConfigSaveConfirmModal";
import type {
  AdminConfigurationDataDto,
  ConfigCommissionRow,
  ConfigEmailTemplate,
  ConfigIntegration,
  ConfigPilotOverridePreview,
  IntegrationStatus,
} from "@/types/admin-configuration";

function CardIcon({ children }: { children: React.ReactNode }) {
  return <span className="admin-config-card-icon" aria-hidden>{children}</span>;
}

function CommissionRow({ row, compact }: { row: ConfigCommissionRow; compact?: boolean }) {
  return (
    <li className={`admin-config-row${compact ? " admin-config-row--compact" : ""}`}>
      <div className="admin-config-row-copy">
        <p className="admin-config-row-label">{row.label}</p>
        {row.description ? (
          <p className="admin-config-row-desc">{row.description}</p>
        ) : null}
      </div>
      <span className="admin-config-value-pill">{row.value}</span>
    </li>
  );
}

function PilotOverrideField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="admin-config-override-field">
      <p className="admin-config-override-label">{label}</p>
      <p
        className={`admin-config-override-value${highlight ? " admin-config-override-value--gold" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function integrationStatusClass(status: IntegrationStatus): string {
  switch (status) {
    case "connected":
      return "admin-config-integration-status--connected";
    case "configured":
      return "admin-config-integration-status--configured";
    case "missing":
      return "admin-config-integration-status--missing";
    case "not_configured":
    default:
      return "admin-config-integration-status--off";
  }
}

function integrationStatusLabel(status: IntegrationStatus): string {
  switch (status) {
    case "connected":
      return "CONNECTED";
    case "configured":
      return "CONFIGURED";
    case "missing":
      return "MISSING KEY";
    case "not_configured":
    default:
      return "NOT CONFIGURED";
  }
}

type AdminConfigurationPortalProps = {
  canManage: boolean;
};

export function AdminConfigurationPortal({ canManage }: AdminConfigurationPortalProps) {
  const [data, setData] = useState<AdminConfigurationDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pilotSearch, setPilotSearch] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<ConfigEmailTemplate | null>(
    null,
  );
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/configuration");
      const json = (await res.json()) as AdminConfigurationDataDto & {
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load configuration.");
        setData(null);
      } else {
        setData(json);
        setPilotSearch(json.pilotOverridePreview.pilotName);
      }
    } catch {
      setError("Failed to load configuration.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSaveConfirm() {
    if (!canManage || !data) return;
    setShowSaveConfirm(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/configuration", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          security: data.security,
          pilotOverridePreview: data.pilotOverridePreview,
        }),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to save configuration.");
        return;
      }
      setNotice(json.message ?? "Configuration saved.");
      await load();
    } catch {
      setError("Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  }

  function handlePilotSearch() {
    setNotice("Pilot search uses the override preview panel below.");
  }

  async function handleSaveOverride() {
    if (!canManage || !data) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/configuration", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotOverridePreview: {
            ...data.pilotOverridePreview,
            pilotName: pilotSearch || data.pilotOverridePreview.pilotName,
          },
        }),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to save override.");
        return;
      }
      setNotice(json.message ?? "Pilot override saved.");
      await load();
    } catch {
      setError("Failed to save override.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="admin-config-loading">Loading configuration…</p>;
  }

  const stats = data?.contentStats;
  const override = data?.pilotOverridePreview;

  return (
    <div className="admin-config-page">
      <section
        className="admin-config-hero admin-ops-bracket-card"
        aria-label="Platform configuration"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-config-hero-inner">
          <div className="admin-config-hero-copy">
            <p className="admin-ops-eyebrow">PLATFORM SETTINGS</p>
            <h1 className="admin-config-hero-title">Configuration</h1>
            <p className="admin-config-hero-desc">
              Platform-wide settings. Changes apply to every user immediately — handle
              with care.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <p className="admin-config-banner admin-config-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="admin-config-banner admin-config-banner--info" role="status">
          {notice}
        </p>
      ) : null}

      {stats ? (
        <section className="admin-config-stats-grid" aria-label="Content metrics">
          <article className="admin-config-stat-card">
            <p className="admin-config-stat-label">PUBLISHED PAGES</p>
            <p className="admin-config-stat-value">{stats.publishedPages}</p>
          </article>
          <article className="admin-config-stat-card">
            <p className="admin-config-stat-label">DRAFTS</p>
            <p className="admin-config-stat-value">{stats.drafts}</p>
          </article>
          <article className="admin-config-stat-card">
            <p className="admin-config-stat-label">SCHEDULED</p>
            <p className="admin-config-stat-value">{stats.scheduled}</p>
          </article>
          <article className="admin-config-stat-card">
            <p className="admin-config-stat-label">AVG. READ TIME</p>
            <p className="admin-config-stat-value admin-config-stat-value--sm">
              {stats.avgReadTimeLabel}
            </p>
          </article>
        </section>
      ) : null}

      <div className="admin-config-bento">
        <section
          className="admin-config-card admin-config-card--fees"
          aria-label="Fees and commission"
        >
          <header className="admin-config-card-head admin-config-card-head--border">
            <div>
              <h2 className="admin-config-card-title">FEES & COMMISSION</h2>
              <p className="admin-config-card-sub">Default platform take rates</p>
            </div>
            <CardIcon>💳</CardIcon>
          </header>

          {data?.defaultCommission ? (
            <ul className="admin-config-rows">
              <CommissionRow row={data.defaultCommission} />
            </ul>
          ) : null}

          {data?.gradeRates.length ? (
            <>
              <h3 className="admin-config-section-title">By pilot grade</h3>
              <ul className="admin-config-rows admin-config-rows--compact">
                {data.gradeRates.map((row) => (
                  <CommissionRow key={row.id} row={row} compact />
                ))}
              </ul>
            </>
          ) : null}

          {data?.manageRules.length ? (
            <>
              <h3 className="admin-config-section-title">Manage rules</h3>
              <ul className="admin-config-rows admin-config-rows--compact">
                {data.manageRules.map((row) => (
                  <CommissionRow key={row.id} row={row} />
                ))}
              </ul>
            </>
          ) : null}

          {override ? (
            <>
              <h3 className="admin-config-section-title">Custom pilot rates</h3>
              <div className="admin-config-pilot-search">
                <label className="admin-config-pilot-search-field">
                  <span className="sr-only">Search pilot by name</span>
                  <input
                    type="search"
                    className="admin-config-pilot-search-input"
                    placeholder="Search a pilot by name"
                    value={pilotSearch}
                    onChange={(event) => setPilotSearch(event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="admin-config-pilot-search-btn"
                  onClick={handlePilotSearch}
                >
                  Search
                </button>
              </div>
              <PilotOverridePanel override={override} />
              {canManage ? (
                <div className="admin-config-override-actions">
                  <button
                    type="button"
                    className="admin-config-btn-gold admin-config-btn-save-override"
                    onClick={handleSaveOverride}
                  >
                    Save Override
                  </button>
                  <Link
                    href="/dashboard/admin/users"
                    className="admin-config-btn-outline admin-config-btn-all-pilots"
                  >
                    See All Pilots
                  </Link>
                </div>
              ) : null}
            </>
          ) : null}
        </section>

        <section className="admin-config-card" aria-label="Email templates">
          <header className="admin-config-card-head admin-config-card-head--border">
            <div>
              <h2 className="admin-config-card-title">EMAIL TEMPLATES</h2>
              <p className="admin-config-card-sub">Automated notifications</p>
            </div>
            <CardIcon>✉</CardIcon>
          </header>
          <ul className="admin-config-template-list">
            {data?.emailTemplates.map((template) => (
              <li key={template.id} className="admin-config-template-row">
                <span className="admin-config-template-name">{template.name}</span>
                {canManage ? (
                  <button
                    type="button"
                    className="admin-config-link-btn"
                    onClick={() => setEditingTemplate(template)}
                  >
                    EDIT
                  </button>
                ) : (
                  <span className="admin-config-link-btn admin-config-link-btn--muted">
                    VIEW
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-config-card" aria-label="Integrations">
          <header className="admin-config-card-head admin-config-card-head--border">
            <div>
              <h2 className="admin-config-card-title">INTEGRATIONS</h2>
              <p className="admin-config-card-sub">Connected services</p>
            </div>
            <CardIcon>⬡</CardIcon>
          </header>
          <div className="admin-config-integrations-grid admin-config-integrations-grid--bento">
            {data?.integrations.map((integration: ConfigIntegration) => (
              <article
                key={integration.id}
                className="admin-config-integration-card"
                title={integration.detail}
              >
                <p className="admin-config-integration-name">{integration.name}</p>
                <p
                  className={`admin-config-integration-status ${integrationStatusClass(integration.status)}`}
                >
                  <span className="admin-config-integration-dot" aria-hidden />
                  {integrationStatusLabel(integration.status)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-config-card" aria-label="Security">
          <header className="admin-config-card-head admin-config-card-head--border">
            <div>
              <h2 className="admin-config-card-title">SECURITY</h2>
              <p className="admin-config-card-sub">Authentication and access</p>
            </div>
            <CardIcon>🛡</CardIcon>
          </header>
          <ul className="admin-config-security-list">
            {data?.security.map((setting) => (
              <li key={setting.id} className="admin-config-security-row">
                <span className="admin-config-security-label">{setting.label}</span>
                <label className="admin-config-toggle">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    disabled
                    aria-label={setting.label}
                    title={
                      setting.integrated
                        ? undefined
                        : "Not integrated — preview only"
                    }
                  />
                  <span className="admin-config-toggle-track" aria-hidden />
                </label>
              </li>
            ))}
          </ul>
          {canManage ? (
            <div className="admin-config-save-wrap admin-config-save-wrap--inline">
              <button
                type="button"
                className="admin-config-btn-gold admin-config-btn-save"
                onClick={() => setShowSaveConfirm(true)}
              >
                SAVE CHANGES
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {editingTemplate ? (
        <AdminConfigEmailTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      ) : null}

      {showSaveConfirm ? (
        <AdminConfigSaveConfirmModal
          saving={saving}
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={handleSaveConfirm}
        />
      ) : null}
    </div>
  );
}

function PilotOverridePanel({ override }: { override: ConfigPilotOverridePreview }) {
  return (
    <div className="admin-config-override-panel">
      <PilotOverrideField label="PILOT" value={override.pilotName} highlight />
      <PilotOverrideField label="Rank" value={override.rank} />
      <PilotOverrideField
        label="DEFAULT COMMISSION"
        value={override.defaultCommission}
      />
      <PilotOverrideField
        label="MANUAL OVERRIDE"
        value={override.manualOverrideEnabled ? "Enabled" : "Disabled"}
      />
      <PilotOverrideField
        label="CUSTOM COMMISSION RATE"
        value={override.customCommissionRate}
      />
      <PilotOverrideField label="REASON" value={override.reason} />
      <PilotOverrideField label="EFFECTIVE DATE" value={override.effectiveDate} />
    </div>
  );
}
