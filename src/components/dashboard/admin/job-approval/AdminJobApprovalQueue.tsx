"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminJobApprovalModal } from "@/components/dashboard/admin/job-approval/AdminJobApprovalModal";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import {
  isJobApprovalStatusFilter,
  mapAdminJobToQueueRow,
} from "@/lib/admin/job-approval-queue-map";
import { jobAdminStatusFilterTabs } from "@/lib/ui/status-filter-tabs";
import type { AdminJobDto } from "@/types/admin-job";
import type {
  JobApprovalQueueData,
  JobApprovalQueueRow,
  JobApprovalStatusFilter,
  JobRiskLevel,
} from "@/types/admin-job-approval";

const PAGE_SIZE = 8;
const STATUS_TABS = jobAdminStatusFilterTabs();

type AdminJobApprovalQueueProps = {
  initialData: JobApprovalQueueData;
};

type ModalState = {
  open: boolean;
  mode: "approve" | "reject";
  row: JobApprovalQueueRow | null;
};

function panelTitleFor(status: JobApprovalStatusFilter): string {
  switch (status) {
    case "pending_approval":
      return "Awaiting review";
    case "open":
      return "Approved missions";
    case "rejected":
      return "Rejected missions";
    default:
      return "All missions";
  }
}

export function AdminJobApprovalQueue({ initialData }: AdminJobApprovalQueueProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canPerform } = useModeratorPermissions();
  const canReview = canPerform("jobApproval", "review");
  const canApprove = canPerform("jobApproval", "approve");
  const canReject = canPerform("jobApproval", "reject");

  const urlStatus = searchParams.get("status");
  const initialStatus = isJobApprovalStatusFilter(urlStatus)
    ? urlStatus
    : initialData.statusFilter;

  const [statusFilter, setStatusFilter] =
    useState<JobApprovalStatusFilter>(initialStatus);
  const [rows, setRows] = useState(initialData.rows);
  const [stats, setStats] = useState(initialData.stats);
  const [totalPending, setTotalPending] = useState(initialData.totalPending);
  const [totalMatching, setTotalMatching] = useState(initialData.totalMatching);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<JobRiskLevel | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "approve",
    row: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<{
    mode: "approve" | "reject";
    title: string;
  } | null>(null);

  useEffect(() => {
    if (isJobApprovalStatusFilter(urlStatus) && urlStatus !== statusFilter) {
      setStatusFilter(urlStatus);
      setPage(1);
    }
  }, [urlStatus, statusFilter]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (riskFilter !== "all" && row.riskLevel !== riskFilter) return false;
      if (!query) return true;
      return [row.title, row.missionId, row.postedBy, row.location, row.budget]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [rows, riskFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const rangeStart =
    filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  const syncUrl = useCallback(
    (nextStatus: JobApprovalStatusFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextStatus === "pending_approval") {
        params.delete("status");
      } else {
        params.set("status", nextStatus);
      }
      const query = params.toString();
      router.replace(
        query ? `/dashboard/admin/jobs?${query}` : "/dashboard/admin/jobs",
        { scroll: false },
      );
    },
    [router, searchParams],
  );

  const loadQueue = useCallback(async (nextStatus: JobApprovalStatusFilter) => {
    setLoading(true);
    setLoadError(null);
    try {
      const [listRes, pendingRes] = await Promise.all([
        fetch(
          nextStatus === "all"
            ? "/api/admin/jobs?status=all"
            : `/api/admin/jobs?status=${nextStatus}`,
        ),
        nextStatus === "pending_approval"
          ? null
          : fetch("/api/admin/jobs?status=pending_approval"),
      ]);

      const listJson = (await listRes.json()) as {
        jobs?: AdminJobDto[];
        error?: string;
      };
      if (!listRes.ok) {
        setLoadError(listJson.error ?? "Failed to load jobs.");
        return;
      }

      let jobs = listJson.jobs ?? [];
      if (nextStatus === "all") {
        jobs = jobs.filter((job) =>
          ["pending_approval", "open", "rejected"].includes(job.status),
        );
      }

      const nextRows = jobs.map(mapAdminJobToQueueRow);
      setRows(nextRows);
      setTotalMatching(nextRows.length);

      let pendingJobs = nextStatus === "pending_approval" ? jobs : [];
      if (pendingRes) {
        const pendingJson = (await pendingRes.json()) as {
          jobs?: AdminJobDto[];
        };
        if (pendingRes.ok) {
          pendingJobs = pendingJson.jobs ?? [];
        }
      }

      const pendingRows = pendingJobs.map(mapAdminJobToQueueRow);
      setTotalPending(pendingRows.length);

      const highRisk = pendingRows.filter((r) => r.riskLevel === "high").length;
      setStats((current) =>
        current.map((card) => {
          if (card.label === "AWAITING REVIEW") {
            return {
              ...card,
              value: String(pendingRows.length),
              subtext:
                highRisk > 0
                  ? `${highRisk} flagged high-risk`
                  : "No high-risk flags",
            };
          }
          return card;
        }),
      );
    } catch {
      setLoadError("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  function selectStatus(nextStatus: JobApprovalStatusFilter) {
    setStatusFilter(nextStatus);
    setPage(1);
    setRiskFilter("all");
    setSearchQuery("");
    syncUrl(nextStatus);
    void loadQueue(nextStatus);
  }

  function openModal(mode: "approve" | "reject", row: JobApprovalQueueRow) {
    setModalError(null);
    setModal({ open: true, mode, row });
  }

  async function handleConfirm(reason?: string) {
    if (!modal.row) return;

    setSubmitting(true);
    setModalError(null);

    const endpoint =
      modal.mode === "approve"
        ? `/api/admin/jobs/${modal.row.id}/approve`
        : `/api/admin/jobs/${modal.row.id}/reject`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers:
        modal.mode === "reject"
          ? { "Content-Type": "application/json" }
          : undefined,
      body:
        modal.mode === "reject"
          ? JSON.stringify({ reason: reason ?? "" })
          : undefined,
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setModalError(data.error ?? "Action failed.");
      return;
    }

    setActionNotice({
      mode: modal.mode,
      title: modal.row.title,
    });
    setModal({ open: false, mode: "approve", row: null });

    setStats((current) =>
      current.map((card) => {
        if (card.label === "AWAITING REVIEW") {
          const next = Math.max(0, Number(card.value) - 1);
          return { ...card, value: String(next) };
        }
        if (card.label === "APPROVED TODAY" && modal.mode === "approve") {
          return { ...card, value: String(Number(card.value) + 1) };
        }
        if (card.label === "REJECTED (7D)" && modal.mode === "reject") {
          return { ...card, value: String(Number(card.value) + 1) };
        }
        return card;
      }),
    );
    setTotalPending((count) => Math.max(0, count - 1));

    await loadQueue(statusFilter);
  }

  return (
    <div className="admin-job-approval-page">
      <section
        className="admin-job-approval-hero admin-ops-bracket-card"
        aria-label="Job approval queue"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-job-approval-hero-copy">
          <p className="admin-ops-eyebrow">MISSION CONTROL</p>
          <h1 className="admin-job-approval-hero-title">Job Approval</h1>
          <p className="admin-job-approval-hero-desc">
            Review awaiting missions, browse approved and rejected jobs, and
            release work to the pilot network.
          </p>
        </div>
      </section>

      <section className="admin-job-approval-stats-grid" aria-label="Queue statistics">
        {stats.map((stat) => {
          if (stat.statusFilter) {
            return (
              <button
                key={stat.label}
                type="button"
                className={`admin-job-approval-stat-card admin-job-approval-stat-card--${stat.tone} admin-job-approval-stat-card--clickable${
                  stat.statusFilter === statusFilter
                    ? " admin-job-approval-stat-card--active"
                    : ""
                }`}
                onClick={() => selectStatus(stat.statusFilter!)}
              >
                <span className="admin-job-approval-stat-corner" aria-hidden />
                <p className="admin-job-approval-stat-label">{stat.label}</p>
                <p className="admin-job-approval-stat-value">{stat.value}</p>
                <p className="admin-job-approval-stat-sub">{stat.subtext}</p>
              </button>
            );
          }

          return (
            <article
              key={stat.label}
              className={`admin-job-approval-stat-card admin-job-approval-stat-card--${stat.tone}`}
            >
              <span className="admin-job-approval-stat-corner" aria-hidden />
              <p className="admin-job-approval-stat-label">{stat.label}</p>
              <p className="admin-job-approval-stat-value">{stat.value}</p>
              <p className="admin-job-approval-stat-sub">{stat.subtext}</p>
            </article>
          );
        })}
      </section>

      {actionNotice ? (
        <div
          className={`admin-job-approval-notice admin-job-approval-notice--${actionNotice.mode}`}
          role="status"
        >
          <div>
            <p className="admin-job-approval-notice-title">
              {actionNotice.mode === "approve"
                ? "Mission approved"
                : "Mission rejected"}
            </p>
            <p className="admin-job-approval-notice-copy">
              {actionNotice.title}
              {actionNotice.mode === "approve"
                ? " — now Open. Grade visibility delays are active; A-1 cannot bid."
                : " — client notified. They can edit and resubmit."}
            </p>
          </div>
          <button
            type="button"
            className="admin-job-approval-notice-dismiss"
            onClick={() => setActionNotice(null)}
            aria-label="Dismiss notice"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="admin-job-approval-panel" aria-label="Mission queue">
        <div className="admin-job-approval-toolbar">
          <div className="admin-job-approval-toolbar-top">
            <div className="admin-job-approval-toolbar-copy">
              <h2 className="admin-job-approval-panel-title">
                {panelTitleFor(statusFilter)}
              </h2>
              <p className="admin-job-approval-panel-sub">
                {loading
                  ? "Loading queue…"
                  : `${filteredRows.length} mission${filteredRows.length === 1 ? "" : "s"} shown`}
              </p>
            </div>
            <div className="admin-job-approval-panel-tools">
              <div className="admin-job-approval-filter-wrap">
                <button
                  type="button"
                  className="admin-job-approval-icon-btn"
                  aria-label="Filter by risk"
                  onClick={() => setFilterOpen((open) => !open)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M2.5 4h11M4.5 8h7M6.5 12h3"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {filterOpen ? (
                  <div className="admin-job-approval-filter-menu">
                    {(["all", "low", "medium", "high"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        className="admin-job-approval-filter-option"
                        onClick={() => {
                          setRiskFilter(level);
                          setPage(1);
                          setFilterOpen(false);
                        }}
                      >
                        {level === "all"
                          ? "All risk levels"
                          : `${level.toUpperCase()} RISK`}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="admin-job-approval-icon-btn"
                aria-label="Refresh queue"
                onClick={() => void loadQueue(statusFilter)}
                disabled={loading}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M13.5 8A5.5 5.5 0 1 1 11 3.2"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13.5 2.5v3h-3"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="admin-job-approval-status-tabs"
            role="tablist"
            aria-label="Filter by job status"
          >
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={statusFilter === tab.value}
                className={`admin-job-approval-status-tab${
                  statusFilter === tab.value
                    ? " admin-job-approval-status-tab--active"
                    : ""
                }`}
                onClick={() => selectStatus(tab.value)}
              >
                {tab.label}
                {tab.value === "pending_approval" ? (
                  <span className="admin-job-approval-status-count">
                    {totalPending}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <label className="admin-job-approval-search">
            <input
              type="search"
              className="admin-job-approval-search-input"
              aria-label="Search by title or client"
              placeholder="Search by title or client"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>

        {loadError ? (
          <p className="admin-job-approval-empty" role="alert">
            {loadError}
          </p>
        ) : null}

        <ul className="admin-job-approval-mission-list">
          {loading ? (
            <li className="admin-job-approval-empty">Loading missions…</li>
          ) : pageRows.length === 0 ? (
            <li className="admin-job-approval-empty">
              No missions match this filter.
            </li>
          ) : (
            pageRows.map((row) => {
              const canModerate = row.status === "pending_approval";
              return (
                <li
                  key={row.id}
                  className={`admin-job-approval-mission-row${
                    row.riskLevel === "high"
                      ? " admin-job-approval-mission-row--high-risk"
                      : ""
                  }`}
                >
                  {row.riskLevel === "high" ? (
                    <span className="admin-job-approval-risk-mark" aria-hidden>
                      !
                    </span>
                  ) : null}
                  <div className="admin-job-approval-mission-main">
                    <div className="admin-job-approval-mission-top">
                      <span className="admin-job-approval-mission-id">
                        {row.missionId}
                      </span>
                      <span
                        className={`admin-job-approval-status-badge admin-job-approval-status-badge--${row.status}`}
                      >
                        {row.statusLabel}
                      </span>
                      <span
                        className={`admin-job-approval-risk-badge admin-job-approval-risk-badge--${row.riskLevel}`}
                      >
                        {row.riskLabel}
                      </span>
                      {row.isNightOp ? (
                        <span className="admin-job-approval-night-badge">
                          NIGHT OP
                        </span>
                      ) : null}
                    </div>
                    <h3 className="admin-job-approval-mission-title">
                      {row.title}
                    </h3>
                    <div className="admin-job-approval-mission-meta">
                      <span>
                        <span className="admin-job-approval-meta-label">
                          POSTED BY:
                        </span>{" "}
                        {row.postedBy}
                      </span>
                      <span>
                        <span className="admin-job-approval-meta-label">
                          LOCATION:
                        </span>{" "}
                        {row.location}
                      </span>
                      <span>
                        <span className="admin-job-approval-meta-label">
                          BUDGET:
                        </span>{" "}
                        <span className="admin-job-approval-budget">
                          {row.budget}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="admin-job-approval-mission-actions">
                    {canReview ? (
                      <Link
                        href={row.reviewHref}
                        className="admin-job-approval-btn admin-job-approval-btn--ghost"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden
                        >
                          <circle
                            cx="7"
                            cy="7"
                            r="2.25"
                            stroke="currentColor"
                            strokeWidth="1.1"
                          />
                          <path
                            d="M1.5 7s1.75-3.5 5.5-3.5S12.5 7 12.5 7s-1.75 3.5-5.5 3.5S1.5 7 1.5 7z"
                            stroke="currentColor"
                            strokeWidth="1.1"
                          />
                        </svg>
                        {canModerate ? "Review" : "View"}
                      </Link>
                    ) : null}
                    {canModerate && canReject ? (
                      <button
                        type="button"
                        className="admin-job-approval-btn admin-job-approval-btn--reject"
                        aria-label={`Reject ${row.missionId}`}
                        onClick={() => openModal("reject", row)}
                      >
                        Reject
                      </button>
                    ) : null}
                    {canModerate && canApprove ? (
                      <button
                        type="button"
                        className="admin-job-approval-btn admin-job-approval-btn--approve"
                        onClick={() => openModal("approve", row)}
                      >
                        Approve
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <div className="admin-job-approval-panel-footer">
          <p className="admin-job-approval-footer-count">
            SHOWING {rangeStart}-{rangeEnd} OF {filteredRows.length} MISSIONS
            {filteredRows.length !== totalMatching
              ? ` (${totalMatching} in status)`
              : ""}
          </p>
          <div className="admin-job-approval-footer-nav">
            <button
              type="button"
              className="admin-job-approval-nav-link"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              PREVIOUS
            </button>
            <button
              type="button"
              className="admin-job-approval-nav-link admin-job-approval-nav-link--active"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              NEXT
            </button>
          </div>
        </div>
      </section>

      <AdminJobApprovalModal
        open={modal.open}
        mode={modal.mode}
        missionTitle={modal.row?.title ?? ""}
        missionId={modal.row?.missionId}
        submitting={submitting}
        error={modalError}
        onCancel={() => {
          if (!submitting) {
            setModal({ open: false, mode: "approve", row: null });
            setModalError(null);
          }
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
