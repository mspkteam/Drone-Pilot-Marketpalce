"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminDisputeResolveModal } from "@/components/dashboard/admin/disputes/AdminDisputeResolveModal";
import { AdminDisputeVoteModal } from "@/components/dashboard/admin/disputes/AdminDisputeVoteModal";
import {
  sortDisputeRows,
  toDisputeCenterRow,
} from "@/lib/admin/dispute-center-filters";
import type {
  AdminDisputeCenterData,
  AdminDisputeCenterRow,
  DisputePriority,
} from "@/types/admin-dispute";
import type { DisputeListItemDto, DisputeStatus } from "@/types/dispute";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import type { UserRole } from "@/types/roles";

type AdminDisputeCenterProps = {
  initialData: AdminDisputeCenterData;
  viewerRole: UserRole;
};

type SortOption = "priority" | "newest" | "oldest";

type ModalState =
  | { type: "none" }
  | { type: "vote"; row: AdminDisputeCenterRow }
  | {
      type: "resolve";
      row: AdminDisputeCenterRow;
      canResolve: boolean;
      needsReview: boolean;
    };

const ACTIVE_STATUSES = new Set<DisputeStatus>(["open", "under_review"]);

export function AdminDisputeCenter({
  initialData,
  viewerRole,
}: AdminDisputeCenterProps) {
  const [stats] = useState(initialData.stats);
  const [rows, setRows] = useState<AdminDisputeCenterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<DisputePriority | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const { canPerform } = useModeratorPermissions();
  const canResolve = canPerform("disputes", "resolve");
  const canRecommend = canPerform("disputes", "recommend");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = showArchive ? "resolved" : "all";
      const res = await fetch(`/api/admin/disputes?status=${statusParam}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load disputes.");
        setRows([]);
        return;
      }

      const disputes = (data.disputes ?? []) as DisputeListItemDto[];
      const active = disputes.filter((dispute) =>
        showArchive
          ? dispute.status === "resolved"
          : ACTIVE_STATUSES.has(dispute.status),
      );

      setRows(active.map(toDisputeCenterRow));
    } catch {
      setError("Failed to load disputes.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [showArchive]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (priorityFilter !== "all" && row.priority !== priorityFilter) return false;
      if (!query) return true;

      return [
        row.disputeId,
        row.missionId,
        row.title,
        row.description,
      ].some((value) => value.toLowerCase().includes(query));
    });

    return sortDisputeRows(filtered, sortBy);
  }, [rows, searchQuery, sortBy, statusFilter, priorityFilter]);

  function openResolve(row: AdminDisputeCenterRow) {
    setModal({
      type: "resolve",
      row,
      canResolve: canResolve && row.status === "under_review",
      needsReview: row.status === "open",
    });
  }

  return (
    <div className="admin-dispute-page">
      <section
        className="admin-dispute-hero admin-ops-bracket-card"
        aria-label="Disputes center"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-dispute-hero-copy">
          <p className="admin-ops-eyebrow">DISPUTES CENTER</p>
          <h1 className="admin-dispute-hero-title">Disputes</h1>
          <p className="admin-dispute-hero-desc">
            Every open case in one place. Aim to resolve within 72 hours to
            maintain trust scores.
          </p>
        </div>
      </section>

      <section className="admin-dispute-stats-grid" aria-label="Dispute statistics">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={`admin-dispute-stat-card admin-dispute-stat-card--${stat.tone}`}
          >
            <span className="admin-dispute-stat-corner" aria-hidden />
            <p className="admin-dispute-stat-label">{stat.label}</p>
            <p className="admin-dispute-stat-value">{stat.value}</p>
            <p className="admin-dispute-stat-sub">{stat.subtext}</p>
          </article>
        ))}
      </section>

      <section className="admin-dispute-active-section" aria-label="Active disputes">
        <div className="admin-dispute-section-head">
          <h2 className="admin-dispute-section-title">
            {showArchive ? "PRIOR ARCHIVE" : "ACTIVE DISPUTES"}
          </h2>
          <div className="admin-dispute-section-tools">
            <div className="admin-dispute-filter-wrap">
              <button
                type="button"
                className="admin-dispute-tool-btn"
                onClick={() => setFilterOpen((open) => !open)}
              >
                FILTER
              </button>
              {filterOpen ? (
                <div className="admin-dispute-filter-menu">
                  <input
                    type="search"
                    className="admin-dispute-search"
                    placeholder="Search cases..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                  <select
                    className="admin-dispute-select"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value as DisputeStatus | "all")
                    }
                  >
                    <option value="all">All statuses</option>
                    <option value="open">Open</option>
                    <option value="under_review">In review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    className="admin-dispute-select"
                    value={priorityFilter}
                    onChange={(event) =>
                      setPriorityFilter(
                        event.target.value as DisputePriority | "all",
                      )
                    }
                  >
                    <option value="all">All priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              ) : null}
            </div>
            <select
              className="admin-dispute-sort-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              aria-label="Sort disputes"
            >
              <option value="priority">SORT BY PRIORITY</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {error ? (
          <p className="admin-dispute-list-error" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="admin-dispute-list-status">Loading disputes…</p>
        ) : filteredRows.length === 0 ? (
          <p className="admin-dispute-list-status">
            No disputes match these filters.
          </p>
        ) : (
          <ul className="admin-dispute-card-list">
            {filteredRows.map((row) => (
              <li
                key={row.id}
                className={`admin-dispute-card admin-dispute-card--${row.priority}`}
              >
                <div className="admin-dispute-card-main">
                  <div className="admin-dispute-card-top">
                    <span className="admin-dispute-card-id">{row.disputeId}</span>
                    <span className="admin-dispute-card-mission">{row.missionId}</span>
                    <span
                      className={`admin-dispute-priority-badge admin-dispute-priority-badge--${row.priority}`}
                    >
                      {row.priorityLabel}
                    </span>
                  </div>
                  <h3 className="admin-dispute-card-title">{row.title}</h3>
                  <p className="admin-dispute-card-desc">{row.description}</p>
                  <p className="admin-dispute-card-opened">{row.openedLabel}</p>
                </div>
                <div className="admin-dispute-card-actions">
                  <Link
                    href={row.detailHref}
                    className="admin-dispute-btn admin-dispute-btn--outline"
                  >
                    OPEN THREAD
                  </Link>
                  <button
                    type="button"
                    className="admin-dispute-btn admin-dispute-btn--ghost"
                    onClick={() => setModal({ type: "vote", row })}
                  >
                    SEND TO SQUADRON VOTE
                  </button>
                  {canResolve || canRecommend ? (
                    <button
                      type="button"
                      className="admin-dispute-btn admin-dispute-btn--gold"
                      onClick={() => openResolve(row)}
                    >
                      {canResolve ? "RESOLVE" : "RECOMMEND RESOLUTION"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!showArchive ? (
          <div className="admin-dispute-archive-wrap">
            <button
              type="button"
              className="admin-dispute-archive-btn"
              onClick={() => setShowArchive(true)}
            >
              LOAD PRIOR ARCHIVE
            </button>
          </div>
        ) : (
          <div className="admin-dispute-archive-wrap">
            <button
              type="button"
              className="admin-dispute-archive-btn"
              onClick={() => setShowArchive(false)}
            >
              BACK TO ACTIVE DISPUTES
            </button>
          </div>
        )}
      </section>

      <AdminDisputeVoteModal
        open={modal.type === "vote"}
        disputeLabel={modal.type === "vote" ? modal.row.disputeId : ""}
        onCancel={() => setModal({ type: "none" })}
      />

      <AdminDisputeResolveModal
        open={modal.type === "resolve"}
        disputeId={modal.type === "resolve" ? modal.row.id : ""}
        disputeLabel={modal.type === "resolve" ? modal.row.disputeId : ""}
        canResolve={modal.type === "resolve" ? modal.canResolve : false}
        needsReview={modal.type === "resolve" ? modal.needsReview : false}
        onCancel={() => setModal({ type: "none" })}
        onResolved={() => {
          setModal({ type: "none" });
          void load();
        }}
      />
    </div>
  );
}
