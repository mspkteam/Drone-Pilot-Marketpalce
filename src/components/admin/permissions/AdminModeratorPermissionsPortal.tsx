"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPermissionSaveModal } from "@/components/admin/permissions/AdminPermissionSaveModal";
import { buildPresetPermissions, presetLabel } from "@/lib/auth/moderator-permissions";
import type {
  AdminPermissionsEngineDto,
  ModeratorPermissionConfig,
  ModeratorPermissionListItem,
  ModeratorPermissionMap,
  PermissionActionKey,
  PermissionModuleDef,
  PermissionModuleKey,
  PermissionPreset,
} from "@/types/moderator-permissions";

const PRESET_OPTIONS: Array<{
  key: PermissionPreset;
  title: string;
  description: string;
}> = [
  {
    key: "full",
    title: "Full Access",
    description:
      "Moderator can access every operational module and all allowed moderator actions.",
  },
  {
    key: "limited",
    title: "Limited Access",
    description: "Moderator can access core review queues only.",
  },
  {
    key: "custom",
    title: "Custom",
    description: "Choose exact modules and actions manually.",
  },
];

function clonePermissionMap(map: ModeratorPermissionMap): ModeratorPermissionMap {
  const next = {} as ModeratorPermissionMap;
  for (const key of Object.keys(map) as PermissionModuleKey[]) {
    next[key] = { ...map[key] };
  }
  return next;
}

type AdminModeratorPermissionsPortalProps = {
  canManage: boolean;
};

export function AdminModeratorPermissionsPortal({
  canManage,
}: AdminModeratorPermissionsPortalProps) {
  const [data, setData] = useState<AdminPermissionsEngineDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ModeratorPermissionConfig | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (userId?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const res = await fetch(`/api/admin/permissions${query}`);
      const json = (await res.json()) as AdminPermissionsEngineDto & {
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load permissions.");
        setData(null);
        return;
      }
      setData(json);
      setSelectedId(json.selectedUserId);
      setDraft(json.config);
    } catch {
      setError("Failed to load permissions.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedModerator = useMemo<ModeratorPermissionListItem | null>(() => {
    if (!data || !selectedId) return null;
    return data.moderators.find((mod) => mod.id === selectedId) ?? null;
  }, [data, selectedId]);

  function handleSelectModerator(mod: ModeratorPermissionListItem) {
    setSelectedId(mod.id);
    setNotice(null);
    void load(mod.id);
  }

  function handlePresetChange(preset: PermissionPreset) {
    if (!draft) return;
    const permissions =
      preset === "custom" ? clonePermissionMap(draft.permissions) : buildPresetPermissions(preset);
    setDraft({
      ...draft,
      preset,
      permissions,
    });
  }

  function toggleAction(
    moduleKey: PermissionModuleKey,
    actionKey: PermissionActionKey,
    enabled: boolean,
  ) {
    if (!draft) return;
    const permissions = clonePermissionMap(draft.permissions);
    const modulePerms = { ...permissions[moduleKey] };

    if (actionKey === "view") {
      modulePerms.view = enabled;
      if (!enabled) {
        for (const key of Object.keys(modulePerms) as PermissionActionKey[]) {
          if (key !== "view") modulePerms[key] = false;
        }
      }
    } else {
      modulePerms[actionKey] = enabled;
      if (enabled) modulePerms.view = true;
    }

    permissions[moduleKey] = modulePerms;
    setDraft({
      ...draft,
      preset: "custom",
      permissions,
    });
  }

  async function handleSaveConfirm() {
    if (!draft || !selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/permissions/${encodeURIComponent(selectedId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preset: draft.preset,
          permissions: draft.permissions,
        }),
      });
      const json = (await res.json()) as {
        config?: ModeratorPermissionConfig;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to save permissions.");
        return;
      }
      if (json.config) setDraft(json.config);
      setNotice(json.message ?? "Moderator permissions saved.");
      setShowSaveConfirm(false);
      void load(selectedId);
    } catch {
      setError("Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return <p className="admin-perms-loading">Loading moderator permissions…</p>;
  }

  return (
    <div className="admin-perms-page">
      <section
        className="admin-perms-hero admin-ops-bracket-card"
        aria-label="Moderator permissions"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-perms-hero-inner">
          <div className="admin-perms-hero-copy">
            <p className="admin-ops-eyebrow">ACCESS CONTROL</p>
            <h1 className="admin-perms-hero-title">Moderator Permissions</h1>
            <p className="admin-perms-hero-desc">
              Give moderators full operational access by default, then limit specific pages
              or actions when needed.
            </p>
          </div>
          {canManage ? (
            <button
              type="button"
              className="admin-perms-btn-save"
              onClick={() => setShowSaveConfirm(true)}
              disabled={!draft || !selectedId}
            >
              Save Permissions
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="admin-perms-banner admin-perms-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="admin-perms-banner admin-perms-banner--info" role="status">
          {notice}
        </p>
      ) : null}

      <div className="admin-perms-layout">
        <aside className="admin-perms-list-panel" aria-label="Moderator list">
          <h2 className="admin-perms-panel-title">MODERATORS</h2>
          <ul className="admin-perms-moderator-list">
            {data?.moderators.map((mod) => {
              const active = mod.id === selectedId;
              return (
                <li key={mod.id}>
                  <button
                    type="button"
                    className={`admin-perms-moderator-card${
                      active ? " admin-perms-moderator-card--active" : ""
                    }`}
                    onClick={() => handleSelectModerator(mod)}
                  >
                    <div className="admin-perms-moderator-top">
                      <span className="admin-perms-moderator-name">{mod.name}</span>
                      <span className="admin-perms-moderator-badge">
                        {presetLabel(mod.preset)}
                      </span>
                    </div>
                    <span className="admin-perms-moderator-email">{mod.email}</span>
                    <div className="admin-perms-moderator-meta">
                      <span className="admin-perms-status">{mod.status}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="admin-perms-detail-panel">
          {selectedModerator && draft ? (
            <>
              <div className="admin-perms-detail-head">
                <div>
                  <h2 className="admin-perms-detail-title">{selectedModerator.name}</h2>
                  <p className="admin-perms-detail-sub">{selectedModerator.email}</p>
                </div>
              </div>

              <section className="admin-perms-presets" aria-label="Access presets">
                <h3 className="admin-perms-section-title">ACCESS PRESET</h3>
                <div className="admin-perms-preset-grid">
                  {PRESET_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`admin-perms-preset-card${
                        draft.preset === option.key
                          ? " admin-perms-preset-card--active"
                          : ""
                      }`}
                      onClick={() => handlePresetChange(option.key)}
                      disabled={!canManage}
                    >
                      <span className="admin-perms-preset-title">{option.title}</span>
                      <span className="admin-perms-preset-desc">{option.description}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="admin-perms-matrix" aria-label="Permission matrix">
                <h3 className="admin-perms-section-title">MODULE PERMISSIONS</h3>
                <div className="admin-perms-module-grid">
                  {data?.modules.map((moduleDef) => (
                    <ModulePermissionCard
                      key={moduleDef.key}
                      moduleDef={moduleDef}
                      permissions={draft.permissions[moduleDef.key]}
                      canManage={canManage}
                      onToggle={(actionKey, enabled) =>
                        toggleAction(moduleDef.key, actionKey, enabled)
                      }
                    />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <p className="admin-perms-empty">Select a moderator to manage permissions.</p>
          )}
        </div>
      </div>

      <AdminPermissionSaveModal
        open={showSaveConfirm}
        moderatorName={selectedModerator?.name ?? "this moderator"}
        saving={saving}
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={() => void handleSaveConfirm()}
      />
    </div>
  );
}

type ModulePermissionCardProps = {
  moduleDef: PermissionModuleDef;
  permissions: ModeratorPermissionMap[PermissionModuleKey] | undefined;
  canManage: boolean;
  onToggle: (actionKey: PermissionActionKey, enabled: boolean) => void;
};

function ModulePermissionCard({
  moduleDef,
  permissions,
  canManage,
  onToggle,
}: ModulePermissionCardProps) {
  return (
    <article className="admin-perms-module-card">
      <h4 className="admin-perms-module-title">{moduleDef.label}</h4>
      <ul className="admin-perms-action-list">
        {moduleDef.actions.map((action) => {
          const enabled = permissions?.[action.key] === true;
          const toggleId = `${moduleDef.key}-${action.key}`;
          return (
            <li key={action.key} className="admin-perms-action-row">
              <div className="admin-perms-action-copy">
                <label htmlFor={toggleId} className="admin-perms-action-label">
                  {action.label}
                </label>
                {action.helperText ? (
                  <p
                    className={`admin-perms-action-helper${
                      action.dangerous ? " admin-perms-action-helper--danger" : ""
                    }`}
                  >
                    {action.helperText}
                  </p>
                ) : null}
              </div>
              <button
                id={toggleId}
                type="button"
                role="switch"
                aria-checked={enabled}
                className={`admin-perms-toggle${enabled ? " admin-perms-toggle--on" : ""}`}
                onClick={() => onToggle(action.key, !enabled)}
                disabled={!canManage}
              >
                <span className="admin-perms-toggle-thumb" aria-hidden />
                <span className="sr-only">
                  {enabled ? "Allowed" : "Restricted"} — {action.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
