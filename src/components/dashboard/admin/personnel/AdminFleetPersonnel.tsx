"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPersonnelInviteModal } from "@/components/dashboard/admin/personnel/AdminPersonnelInviteModal";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import {
  PERSONNEL_REGION_FILTERS,
  PERSONNEL_ROLE_FILTERS,
} from "@/lib/admin/personnel-filters";
import type { PersonnelDirectoryData, PersonnelRow } from "@/types/admin-personnel";

const PAGE_SIZE = 6;

type AdminFleetPersonnelProps = {
  data: PersonnelDirectoryData;
  /** Super Admin only — create/delete Admin and Moderator accounts. */
  canManageManagementUsers?: boolean;
  /** users:edit — hard-delete pilot/client accounts. */
  canDeleteMembers?: boolean;
};

function rowsToCsv(rows: PersonnelRow[]): string {
  const header = "Name,ID,Role,Wings,Region,Status,Joined";
  const lines = rows.map((row) => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [
      escape(row.name),
      escape(row.displayId),
      escape(row.roleLabel),
      escape(row.wingsLabel),
      escape(row.region),
      escape(row.statusLabel),
      escape(row.joinedLabel),
    ].join(",");
  });
  return [header, ...lines].join("\n");
}

function StatusBadge({ row }: { row: PersonnelRow }) {
  return (
    <span
      className={`admin-personnel-status admin-personnel-status--${row.statusTone}`}
    >
      {row.statusLabel}
    </span>
  );
}

export function AdminFleetPersonnel({
  data,
  canManageManagementUsers = false,
  canDeleteMembers = false,
}: AdminFleetPersonnelProps) {
  const searchParams = useSearchParams();
  const { canPerform } = useModeratorPermissions();
  const canExport = canPerform("users", "export");
  const canInvite = canManageManagementUsers;

  const [roleFilter, setRoleFilter] = useState<string>(() => {
    if (searchParams.get("role") === "pilot") return "All pilots";
    if (searchParams.get("role") === "client") return "All clients";
    return "All roles";
  });
  const [regionFilter, setRegionFilter] = useState<string>("Global");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [rows, setRows] = useState(data.rows);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    setRows(data.rows);
  }, [data.rows]);

  useEffect(() => {
    if (searchParams.get("role") === "pilot") {
      setRoleFilter("All pilots");
      setPage(1);
    } else if (searchParams.get("role") === "client") {
      setRoleFilter("All clients");
      setPage(1);
    }
  }, [searchParams]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const roleMatch =
        roleFilter === "All roles"
          ? true
          : roleFilter === "All pilots"
            ? row.role === "pilot"
            : roleFilter === "All clients"
              ? row.role === "client"
              : row.roleFilter === roleFilter;
      const regionMatch =
        regionFilter === "Global" || row.region === regionFilter;
      if (!roleMatch || !regionMatch) return false;
      if (!query) return true;
      return [row.name, row.displayId, row.roleLabel, row.region]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, roleFilter, regionFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const rangeStart =
    filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  const handleExport = useCallback(() => {
    const csv = rowsToCsv(filteredRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fleet-personnel-roster.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [filteredRows]);

  function canDeleteRow(row: PersonnelRow): boolean {
    if (row.isManagementUser) return canManageManagementUsers;
    if (row.role === "pilot" || row.role === "client") return canDeleteMembers;
    return false;
  }

  async function handleDeleteUser(row: PersonnelRow) {
    if (!canDeleteRow(row)) return;
    const kind = row.isManagementUser
      ? row.roleLabel
      : row.role === "pilot"
        ? "pilot"
        : "client";
    if (
      !window.confirm(
        `Permanently delete this ${kind} account (${row.name} / ${row.displayId})?\n\nThis removes the login and related profile data. This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(row.id);
    setActionError(null);
    setActionMessage(null);
    try {
      const endpoint = row.isManagementUser
        ? `/api/admin/management-users/${row.id}`
        : `/api/admin/users/${row.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setActionError(json.error ?? "Failed to delete account.");
        return;
      }
      setRows((current) => current.filter((item) => item.id !== row.id));
      setActionMessage(`Deleted ${kind} account for ${row.name}.`);
    } catch {
      setActionError("Failed to delete account.");
    } finally {
      setDeletingId(null);
    }
  }

  const pilotRosterView =
    roleFilter === "All pilots" || searchParams.get("role") === "pilot";
  const clientRosterView =
    roleFilter === "All clients" || searchParams.get("role") === "client";

  const profileHrefForRow = useCallback(
    (row: PersonnelRow) => {
      if (row.role === "pilot" && pilotRosterView) {
        return `${row.viewHref}?from=pilots`;
      }
      if (row.role === "client" && clientRosterView) {
        return `${row.viewHref}?from=clients`;
      }
      return row.viewHref;
    },
    [pilotRosterView, clientRosterView],
  );

  return (
    <div className="admin-personnel-page">
      <section
        className="admin-personnel-hero admin-ops-bracket-card"
        aria-label="Fleet and personnel"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-personnel-hero-inner">
          <div className="admin-personnel-hero-copy">
            <p className="admin-ops-eyebrow">
              {pilotRosterView
                ? "PILOT ROSTER"
                : clientRosterView
                  ? "CLIENT ROSTER"
                  : "MEMBER DIRECTORY"}
            </p>
            <h1 className="admin-personnel-hero-title">
              {pilotRosterView
                ? "Pilots"
                : clientRosterView
                  ? "Clients"
                  : "Fleet & Personnel"}
            </h1>
            <p className="admin-personnel-hero-desc">
              {pilotRosterView
                ? "Open a pilot profile to review, edit, approve, or assign wings and badges."
                : clientRosterView
                  ? "Open a client profile to review and edit account details, jobs, and status."
                  : "Pilots and clients across all regions — open a profile to manage the full account."}{" "}
              Role column shows display titles (grade / instructor / client type), not login roles — rename in{" "}
              <code>personnel-role-labels.ts</code>.
            </p>
          </div>
          <div className="admin-personnel-hero-actions">
            {canExport ? (
              <button
                type="button"
                className="admin-personnel-btn-export"
                onClick={handleExport}
              >
                Export roster
              </button>
            ) : null}
            {canInvite ? (
              <button
                type="button"
                className="admin-personnel-btn-outline"
                onClick={() => setInviteOpen(true)}
              >
                Add management user
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {actionError ? (
        <p className="admin-personnel-banner-error" role="alert">
          {actionError}
        </p>
      ) : null}
      {actionMessage ? (
        <p className="admin-personnel-banner-success" role="status">
          {actionMessage}
        </p>
      ) : null}

      <section
        className="admin-personnel-stats-grid"
        aria-label="Personnel statistics"
      >
        {data.stats.map((stat) => (
          <article
            key={stat.label}
            className="admin-personnel-stat-card admin-ops-bracket-card"
          >
            <span className="admin-personnel-stat-accent" aria-hidden />
            <p className="admin-personnel-stat-label">{stat.label}</p>
            <p className="admin-personnel-stat-value">{stat.value}</p>
            <p
              className={`admin-personnel-stat-sub${
                stat.subtextTone === "success"
                  ? " admin-personnel-stat-sub--success"
                  : ""
              }`}
            >
              {stat.subtext}
            </p>
          </article>
        ))}
      </section>

      <section className="admin-personnel-directory" aria-label="Personnel directory">
        <div className="admin-personnel-directory-head">
          <div>
            <h2 className="admin-personnel-directory-title">PERSONNEL DIRECTORY</h2>
            <p className="admin-personnel-directory-sub">
              Filter by role, region or status
            </p>
          </div>
          <div className="admin-personnel-filters">
            <select
              className="admin-personnel-select admin-personnel-select--filter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by role"
            >
              {PERSONNEL_ROLE_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              className="admin-personnel-select admin-personnel-select--filter"
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by region"
            >
              {PERSONNEL_REGION_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="admin-personnel-search">
          <span className="sr-only">Search personnel</span>
          <input
            type="search"
            className="admin-personnel-search-input"
            placeholder={
              pilotRosterView
                ? "Search pilots by name or ID"
                : clientRosterView
                  ? "Search clients by name or ID"
                  : "Search by name or ID"
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>

        <div className="admin-personnel-table-wrap">
          <table className="admin-personnel-table">
            <thead>
              <tr>
                <th>NAME / ID</th>
                <th>ROLE</th>
                <th>WINGS</th>
                <th>STATUS</th>
                <th>JOINED</th>
                <th className="admin-personnel-th-actions" scope="col">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length > 0 ? (
                pageRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="admin-personnel-name">{row.name}</span>
                      <span className="admin-personnel-id">{row.displayId}</span>
                    </td>
                    <td className="admin-personnel-role">{row.roleLabel}</td>
                    <td className="admin-personnel-wings">{row.wingsLabel}</td>
                    <td>
                      <StatusBadge row={row} />
                    </td>
                    <td className="admin-personnel-joined">{row.joinedLabel}</td>
                    <td className="admin-personnel-actions">
                      <Link
                        href={profileHrefForRow(row)}
                        className="admin-personnel-action"
                      >
                        Open profile
                      </Link>
                      {canDeleteRow(row) ? (
                        <button
                          type="button"
                          className="admin-personnel-action admin-personnel-action--danger"
                          disabled={deletingId === row.id}
                          onClick={() => void handleDeleteUser(row)}
                        >
                          {deletingId === row.id ? "Deleting…" : "Delete"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="admin-personnel-empty">
                    No personnel match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-personnel-mobile-list">
          {pageRows.length > 0 ? (
            pageRows.map((row) => (
              <article key={row.id} className="admin-personnel-mobile-row">
                <div className="admin-personnel-mobile-top">
                  <div>
                    <span className="admin-personnel-name">{row.name}</span>
                    <span className="admin-personnel-id">{row.displayId}</span>
                  </div>
                  <StatusBadge row={row} />
                </div>
                <dl className="admin-personnel-mobile-grid">
                  <div>
                    <dt>Role</dt>
                    <dd>{row.roleLabel}</dd>
                  </div>
                  <div>
                    <dt>Wings</dt>
                    <dd>{row.wingsLabel}</dd>
                  </div>
                  <div>
                    <dt>Joined</dt>
                    <dd>{row.joinedLabel}</dd>
                  </div>
                </dl>
                <Link
                  href={profileHrefForRow(row)}
                  className="admin-personnel-action"
                >
                  Open profile
                </Link>
                {canDeleteRow(row) ? (
                  <button
                    type="button"
                    className="admin-personnel-action admin-personnel-action--danger"
                    disabled={deletingId === row.id}
                    onClick={() => void handleDeleteUser(row)}
                  >
                    {deletingId === row.id ? "Deleting…" : "Delete"}
                  </button>
                ) : null}
              </article>
            ))
          ) : (
            <p className="admin-personnel-empty admin-personnel-mobile-empty">
              No personnel match the selected filters.
            </p>
          )}
        </div>

        <div className="admin-personnel-directory-footer">
          <p className="admin-personnel-footer-count">
            SHOWING {rangeStart}-{rangeEnd} OF {filteredRows.length.toLocaleString()}{" "}
            ENTRIES
          </p>
          <div className="admin-personnel-pagination">
            <button
              type="button"
              className="admin-personnel-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`admin-personnel-page-btn${
                    pageNum === currentPage ? " admin-personnel-page-btn--active" : ""
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              ),
            )}
            <button
              type="button"
              className="admin-personnel-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <AdminPersonnelInviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
