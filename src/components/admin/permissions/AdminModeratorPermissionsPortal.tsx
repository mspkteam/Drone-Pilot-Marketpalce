"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPersonnelInviteModal } from "@/components/dashboard/admin/personnel/AdminPersonnelInviteModal";
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
      "Staff can access every operational module and allowed actions.",
  },
  {
    key: "limited",
    title: "Limited Access",
    description: "Staff can access core review queues only.",
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

function roleBadgeLabel(role: "admin" | "moderator"): string {
  return role === "admin" ? "Admin" : "Moderator";
}

type AdminModeratorPermissionsPortalProps = {
  canManage: boolean;
  /** Server-rendered staff list so Super Admin always sees Admins/Moderators. */
  initialData?: AdminPermissionsEngineDto | null;
};

export function AdminModeratorPermissionsPortal({
  canManage,
  initialData = null,
}: AdminModeratorPermissionsPortalProps) {
  const [data, setData] = useState<AdminPermissionsEngineDto | null>(
    initialData,
  );
  const [loading, setLoading] = useState(!initialData && canManage);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialData?.selectedUserId ?? null,
  );
  const [draft, setDraft] = useState<ModeratorPermissionConfig | null>(
    initialData?.config ?? null,
  );
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [staffFilter, setStaffFilter] = useState<"all" | "admin" | "moderator">(
    "all",
  );

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
        return;
      }
      setData(json);
      setSelectedId(json.selectedUserId);
      setDraft(json.config);
    } catch {
      setError("Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManage) return;
    if (initialData) return;
    void load();
  }, [canManage, initialData, load]);

  const staffList = data?.moderators ?? [];
  const filteredStaff = useMemo(() => {
    if (staffFilter === "all") return staffList;
    return staffList.filter((mod) => mod.role === staffFilter);
  }, [staffList, staffFilter]);

  const adminCount = staffList.filter((m) => m.role === "admin").length;
  const moderatorCount = staffList.filter((m) => m.role === "moderator").length;

  const selectedStaff = useMemo<ModeratorPermissionListItem | null>(() => {
    if (!data || !selectedId) return null;
    return data.moderators.find((mod) => mod.id === selectedId) ?? null;
  }, [data, selectedId]);

  function handleSelectStaff(mod: ModeratorPermissionListItem) {
    setSelectedId(mod.id);
    setNotice(null);
    void load(mod.id);
  }

  function handlePresetChange(preset: PermissionPreset) {
    if (!draft) return;
    const permissions =
      preset === "custom"
        ? clonePermissionMap(draft.permissions)
        : buildPresetPermissions(preset);
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
      const res = await fetch(
        `/api/admin/permissions/${encodeURIComponent(selectedId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preset: draft.preset,
            permissions: draft.permissions,
          }),
        },
      );
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
      setNotice(json.message ?? "Permissions saved.");
      setShowSaveConfirm(false);
      void load(selectedId);
    } catch {
      setError("Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) {
    return (
      <div className="admin-perms-restricted">
        <div className="admin-perms-restricted-card">
          <p className="admin-perms-restricted-eyebrow">SUPER ADMIN ONLY</p>
          <h1 className="admin-perms-restricted-title">Staff Permissions</h1>
          <p className="admin-perms-restricted-message">
            Only Super Admin can add Admins/Moderators and limit their access.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return <p className="admin-perms-loading">Loading staff permissions…</p>;
  }

  return (
    <div className="admin-perms-page">
      <section
        className="admin-perms-hero admin-ops-bracket-card"
        aria-label="Staff permissions"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-perms-hero-inner">
          <div className="admin-perms-hero-copy">
            <p className="admin-ops-eyebrow">ACCESS CONTROL</p>
            <h1 className="admin-perms-hero-title">Staff Permissions</h1>
            <p className="admin-perms-hero-desc">
              Limit which admin pages and actions each Admin or Moderator can
              use. Super Admin accounts are not listed here — they always have
              full access.
            </p>
            <p className="admin-perms-hero-counts">
              {adminCount} Admin{adminCount === 1 ? "" : "s"} · {moderatorCount}{" "}
              Moderator{moderatorCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="admin-perms-hero-actions">
            <button
              type="button"
              className="admin-perms-btn-outline"
              onClick={() => setShowAddUser(true)}
            >
              Add Admin / Moderator
            </button>
            <button
              type="button"
              className="admin-perms-btn-save"
              onClick={() => setShowSaveConfirm(true)}
              disabled={!draft || !selectedId || saving}
            >
              Save Permissions
            </button>
          </div>
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
        <aside className="admin-perms-list-panel" aria-label="Staff list">
          <div className="admin-perms-list-head">
            <h2 className="admin-perms-panel-title">STAFF ACCOUNTS</h2>
            <div
              className="admin-perms-filter-row"
              role="tablist"
              aria-label="Filter by role"
            >
              {(
                [
                  ["all", "All"],
                  ["admin", "Admins"],
                  ["moderator", "Mods"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={staffFilter === key}
                  className={`admin-perms-filter-chip${
                    staffFilter === key ? " admin-perms-filter-chip--active" : ""
                  }`}
                  onClick={() => setStaffFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ul className="admin-perms-moderator-list">
            {filteredStaff.map((mod) => {
              const active = mod.id === selectedId;
              return (
                <li key={mod.id}>
                  <button
                    type="button"
                    className={`admin-perms-moderator-card${
                      active ? " admin-perms-moderator-card--active" : ""
                    }`}
                    onClick={() => handleSelectStaff(mod)}
                  >
                    <div className="admin-perms-moderator-top">
                      <span className="admin-perms-moderator-name">{mod.name}</span>
                      <span className="admin-perms-moderator-badge">
                        {presetLabel(mod.preset)}
                      </span>
                    </div>
                    <span className="admin-perms-moderator-email">{mod.email}</span>
                    <div className="admin-perms-moderator-meta">
                      <span
                        className={`admin-perms-role-pill admin-perms-role-pill--${mod.role}`}
                      >
                        {roleBadgeLabel(mod.role)}
                      </span>
                      <span className="admin-perms-status">{mod.status}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {staffList.length === 0 ? (
            <p className="admin-perms-empty-inline">
              No Admin or Moderator accounts yet. Use{" "}
              <strong>Add Admin / Moderator</strong> to create one.
            </p>
          ) : filteredStaff.length === 0 ? (
            <p className="admin-perms-empty-inline">
              No accounts match this filter.
            </p>
          ) : null}
        </aside>

        <div className="admin-perms-detail-panel">
          {selectedStaff && draft ? (
            <>
              <div className="admin-perms-detail-head">
                <div>
                  <h2 className="admin-perms-detail-title">{selectedStaff.name}</h2>
                  <p className="admin-perms-detail-sub">
                    {selectedStaff.email} · {roleBadgeLabel(selectedStaff.role)}
                  </p>
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
                      <span className="admin-perms-preset-desc">
                        {option.description}
                      </span>
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
            <p className="admin-perms-empty">
              Select an Admin or Moderator to manage permissions.
            </p>
          )}
        </div>
      </div>

      <AdminPermissionSaveModal
        open={showSaveConfirm}
        moderatorName={selectedStaff?.name ?? "this user"}
        saving={saving}
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={() => void handleSaveConfirm()}
      />

      <AdminPersonnelInviteModal
        open={showAddUser}
        onClose={() => {
          setShowAddUser(false);
          void load(selectedId);
        }}
      />
    </div>
  );
}

type ModulePermissionCardProps = {
  moduleDef: PermissionModuleDef;
  permissions: Partial<Record<PermissionActionKey, boolean>> | undefined;
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
          return (
            <li key={action.key} className="admin-perms-action-row">
              <div className="admin-perms-action-copy">
                <span className="admin-perms-action-label">
                  {action.label}
                  {action.dangerous ? (
                    <span className="admin-perms-danger-flag"> High risk</span>
                  ) : null}
                </span>
                {action.helperText ? (
                  <p
                    className={`admin-perms-action-helper${
                      action.dangerous
                        ? " admin-perms-action-helper--danger"
                        : ""
                    }`}
                  >
                    {action.helperText}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={action.label}
                className={`admin-perms-toggle${
                  enabled ? " admin-perms-toggle--on" : ""
                }`}
                disabled={!canManage}
                onClick={() => onToggle(action.key, !enabled)}
              >
                <span className="admin-perms-toggle-thumb" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
