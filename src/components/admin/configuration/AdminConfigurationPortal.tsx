"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminConfigEmailTemplateModal } from "@/components/admin/configuration/AdminConfigEmailTemplateModal";
import { AdminConfigSaveConfirmModal } from "@/components/admin/configuration/AdminConfigSaveConfirmModal";
import { AdminCustomPilotRates } from "@/components/admin/configuration/AdminCustomPilotRates";
import type {
  AdminConfigurationDataDto,
  ConfigCommissionRow,
  ConfigEmailTemplate,
  ConfigIntegration,
  IntegrationStatus,
} from "@/types/admin-configuration";

function CardIcon({ children }: { children: React.ReactNode }) {
  return <span className="admin-config-card-icon" aria-hidden>{children}</span>;
}

function EditableCommissionRow({
  row,
  compact,
  canManage,
  onChange,
}: {
  row: ConfigCommissionRow;
  compact?: boolean;
  canManage: boolean;
  onChange: (next: ConfigCommissionRow) => void;
}) {
  return (
    <li className={`admin-config-row${compact ? " admin-config-row--compact" : ""}`}>
      <div className="admin-config-row-copy">
        <p className="admin-config-row-label">{row.label}</p>
        {row.description ? (
          <p className="admin-config-row-desc">{row.description}</p>
        ) : null}
      </div>
      {canManage ? (
        <input
          type="text"
          className="admin-config-inline-input"
          value={row.value}
          onChange={(event) => onChange({ ...row, value: event.target.value })}
          aria-label={`${row.label} rate`}
        />
      ) : (
        <span className="admin-config-value-pill">{row.value}</span>
      )}
    </li>
  );
}

function EditableManageRuleRow({
  row,
  canManage,
  onChange,
}: {
  row: ConfigCommissionRow;
  canManage: boolean;
  onChange: (next: ConfigCommissionRow) => void;
}) {
  return (
    <li className="admin-config-row admin-config-row--compact">
      <div className="admin-config-row-copy">
        {canManage ? (
          <>
            <input
              type="text"
              className="admin-config-inline-input admin-config-inline-input--label"
              value={row.label}
              onChange={(event) => onChange({ ...row, label: event.target.value })}
              aria-label="Rule label"
            />
            <input
              type="text"
              className="admin-config-inline-input admin-config-inline-input--desc"
              value={row.description ?? ""}
              onChange={(event) =>
                onChange({ ...row, description: event.target.value })
              }
              aria-label="Rule description"
              placeholder="Description"
            />
          </>
        ) : (
          <>
            <p className="admin-config-row-label">{row.label}</p>
            {row.description ? (
              <p className="admin-config-row-desc">{row.description}</p>
            ) : null}
          </>
        )}
      </div>
      {canManage ? (
        <input
          type="text"
          className="admin-config-inline-input"
          value={row.value}
          onChange={(event) => onChange({ ...row, value: event.target.value })}
          aria-label={`${row.label} value`}
        />
      ) : (
        <span className="admin-config-value-pill">{row.value}</span>
      )}
    </li>
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
  const [editingTemplate, setEditingTemplate] = useState<ConfigEmailTemplate | null>(
    null,
  );
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [defaultCommissionValue, setDefaultCommissionValue] = useState("15%");
  const [gradeRates, setGradeRates] = useState<ConfigCommissionRow[]>([]);
  const [manageRules, setManageRules] = useState<ConfigCommissionRow[]>([]);

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
        setDefaultCommissionValue(json.defaultCommission.value);
        setGradeRates(json.gradeRates);
        setManageRules(json.manageRules);
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
          defaultCommissionPercent: defaultCommissionValue,
          gradeRates,
          manageRules,
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

  if (loading) {
    return <p className="admin-config-loading">Loading configuration…</p>;
  }

  const stats = data?.contentStats;

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
            <CardIcon>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </CardIcon>
          </header>

          {data?.defaultCommission ? (
            <ul className="admin-config-rows">
              <li className="admin-config-row">
                <div className="admin-config-row-copy">
                  <p className="admin-config-row-label">{data.defaultCommission.label}</p>
                  {data.defaultCommission.description ? (
                    <p className="admin-config-row-desc">
                      {data.defaultCommission.description}
                    </p>
                  ) : null}
                </div>
                {canManage ? (
                  <input
                    type="text"
                    className="admin-config-inline-input"
                    value={defaultCommissionValue}
                    onChange={(event) => setDefaultCommissionValue(event.target.value)}
                    aria-label="Default commission rate"
                  />
                ) : (
                  <span className="admin-config-value-pill">
                    {data.defaultCommission.value}
                  </span>
                )}
              </li>
            </ul>
          ) : null}

          {gradeRates.length ? (
            <>
              <h3 className="admin-config-section-title">By pilot grade (A-1 – A-6)</h3>
              <ul className="admin-config-rows admin-config-rows--compact">
                {gradeRates.map((row) => (
                  <EditableCommissionRow
                    key={row.id}
                    row={row}
                    compact
                    canManage={canManage}
                    onChange={(next) =>
                      setGradeRates((current) =>
                        current.map((item) => (item.id === next.id ? next : item)),
                      )
                    }
                  />
                ))}
              </ul>
            </>
          ) : null}

          {manageRules.length ? (
            <>
              <h3 className="admin-config-section-title">Manage rules</h3>
              <ul className="admin-config-rows admin-config-rows--compact">
                {manageRules.map((row) => (
                  <EditableManageRuleRow
                    key={row.id}
                    row={row}
                    canManage={canManage}
                    onChange={(next) =>
                      setManageRules((current) =>
                        current.map((item) => (item.id === next.id ? next : item)),
                      )
                    }
                  />
                ))}
              </ul>
            </>
          ) : null}

          {canManage ? (
            <div className="admin-config-save-wrap admin-config-save-wrap--inline">
              <button
                type="button"
                className="admin-config-btn-gold admin-config-btn-save"
                onClick={() => setShowSaveConfirm(true)}
                disabled={saving}
              >
                SAVE COMMISSION SETTINGS
              </button>
            </div>
          ) : null}

          <AdminCustomPilotRates canManage={canManage} />
        </section>

        <div className="admin-config-bento-col">
        <section className="admin-config-card" aria-label="Email templates">
          <header className="admin-config-card-head admin-config-card-head--border">
            <div>
              <h2 className="admin-config-card-title">EMAIL TEMPLATES</h2>
              <p className="admin-config-card-sub">Automated notifications</p>
            </div>
            <CardIcon>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                <path
                  d="M4 6h16v12H4V6z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 7l8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardIcon>
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
            <CardIcon>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                <path
                  d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </CardIcon>
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
            <CardIcon>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
                <path
                  d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 12l1.8 1.8L15 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardIcon>
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
