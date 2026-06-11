"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminConfigEmailTemplateModal } from "@/components/admin/configuration/AdminConfigEmailTemplateModal";
import { AdminConfigSaveConfirmModal } from "@/components/admin/configuration/AdminConfigSaveConfirmModal";
import type {
  AdminConfigurationDataDto,
  ConfigEmailTemplate,
  ConfigIntegration,
  IntegrationStatus,
} from "@/types/admin-configuration";

function CardIcon({ children }: { children: React.ReactNode }) {
  return <span className="admin-config-card-icon" aria-hidden>{children}</span>;
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

  function handleSaveConfirm() {
    setShowSaveConfirm(false);
    setNotice(
      "Configuration persistence is pending. Changes are preview-only until backend settings are connected.",
    );
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

      {data?.persistenceMode === "preview" ? (
        <p className="admin-config-banner admin-config-banner--info" role="status">
          Platform settings use read-only and preview values. Fee commission is fixed
          at 10% via <code>DEFAULT_COMMISSION_RATE</code>. Security toggles are not
          integrated yet.
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

      <div className="admin-config-grid">
        <section className="admin-config-card" aria-label="Fees and commission">
          <header className="admin-config-card-head">
            <div>
              <h2 className="admin-config-card-title">FEES & COMMISSION</h2>
              <p className="admin-config-card-sub">Default platform take rates</p>
            </div>
            <CardIcon>💳</CardIcon>
          </header>
          <ul className="admin-config-rows">
            {data?.fees.map((fee) => (
              <li key={fee.id} className="admin-config-row">
                <div className="admin-config-row-copy">
                  <p className="admin-config-row-label">{fee.label}</p>
                  <p className="admin-config-row-desc">{fee.description}</p>
                </div>
                <span className="admin-config-value-pill">{fee.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-config-card" aria-label="Email templates">
          <header className="admin-config-card-head">
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

        <section className="admin-config-card" aria-label="Security">
          <header className="admin-config-card-head">
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
          <p className="admin-config-card-note">
            Security settings are display-only until enforcement backends are connected.
          </p>
        </section>

        <section className="admin-config-card" aria-label="Integrations">
          <header className="admin-config-card-head">
            <div>
              <h2 className="admin-config-card-title">INTEGRATIONS</h2>
              <p className="admin-config-card-sub">Connected services</p>
            </div>
            <CardIcon>⬡</CardIcon>
          </header>
          <div className="admin-config-integrations-grid">
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
      </div>

      {canManage ? (
        <div className="admin-config-save-wrap">
          <button
            type="button"
            className="admin-config-btn-gold admin-config-btn-save"
            onClick={() => setShowSaveConfirm(true)}
          >
            SAVE CHANGES
          </button>
        </div>
      ) : null}

      {editingTemplate ? (
        <AdminConfigEmailTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      ) : null}

      {showSaveConfirm ? (
        <AdminConfigSaveConfirmModal
          saving={false}
          onCancel={() => setShowSaveConfirm(false)}
          onConfirm={handleSaveConfirm}
        />
      ) : null}
    </div>
  );
}
