"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPersonnelEditModal } from "@/components/dashboard/admin/personnel/AdminPersonnelEditModal";
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
}: AdminFleetPersonnelProps) {
  const router = useRouter();
  const { canPerform } = useModeratorPermissions();
  const canExport = canPerform("users", "export");
  const canInvite = canManageManagementUsers;

  const [roleFilter, setRoleFilter] = useState<string>("All roles");
  const [regionFilter, setRegionFilter] = useState<string>("Global");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [rows, setRows] = useState(data.rows);

  useEffect(() => {
    setRows(data.rows);
  }, [data.rows]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const roleMatch =
        roleFilter === "All roles" || row.roleFilter === roleFilter;
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

  return (
    <div className="admin-personnel-page">
      <section
        className="admin-personnel-hero admin-ops-bracket-card"
        aria-label="Fleet and personnel"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-personnel-hero-inner">
          <div className="admin-personnel-hero-copy">
            <p className="admin-ops-eyebrow">MEMBER DIRECTORY</p>
            <h1 className="admin-personnel-hero-title">Fleet &amp; Personnel</h1>
            <p className="admin-personnel-hero-desc">
              Pilots and clients across all regions — view profiles, membership,
              and account status.
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
            placeholder="Search a pilot by name"
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
                      <div className="admin-personnel-actions-row">
                        <Link
                          href={row.viewHref}
                          className="admin-personnel-action"
                        >
                          VIEW
                        </Link>
                        {row.editHref ? (
                          <button
                            type="button"
                            className="admin-personnel-action"
                            onClick={() => setEditUserId(row.id)}
                          >
                            EDIT
                          </button>
                        ) : (
                          <span className="admin-personnel-action admin-personnel-action--disabled">
                            EDIT
                          </span>
                        )}
                      </div>
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
      <AdminPersonnelEditModal
        open={Boolean(editUserId)}
        userId={editUserId}
        onClose={() => setEditUserId(null)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
