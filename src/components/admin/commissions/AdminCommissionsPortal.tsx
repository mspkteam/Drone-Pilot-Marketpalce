"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminRunPayoutsModal } from "@/components/admin/commissions/AdminRunPayoutsModal";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import {
  downloadCommissionLedgerCsv,
  formatCommissionMoney,
} from "@/lib/admin/commission-ledger-client";
import type {
  AdminCommissionLedgerRowDto,
  AdminCommissionStatsDto,
  CommissionLedgerStatus,
} from "@/types/admin-commissions";

const PAGE_SIZE = 5;
const ALL_STATUSES: Array<CommissionLedgerStatus | "ALL"> = [
  "ALL",
  "SETTLED",
  "PENDING",
  "HELD",
];

function statusClass(status: CommissionLedgerStatus): string {
  switch (status) {
    case "SETTLED":
      return "admin-commissions-status admin-commissions-status--settled";
    case "PENDING":
      return "admin-commissions-status admin-commissions-status--pending";
    case "HELD":
      return "admin-commissions-status admin-commissions-status--held";
  }
}

function matchesSearch(value: string, query: string): boolean {
  if (!query.trim()) return true;
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

function isPositiveGrowthSubtext(subtext: string): boolean {
  return subtext.trim().startsWith("+");
}

/** Page numbers for PREVIOUS 01 02 03 … 12 NEXT style pagination. */
function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1, 2, 3];
  if (currentPage > 3 && currentPage < totalPages - 1) {
    items.push("ellipsis", currentPage);
  } else if (totalPages > 4) {
    items.push("ellipsis");
  }
  if (!items.includes(totalPages)) {
    items.push(totalPages);
  }
  return items;
}

export function AdminCommissionsPortal() {
  const { canPerform } = useModeratorPermissions();
  const canRunPayouts = canPerform("commissions", "runPayouts");
  const canExport = canPerform("commissions", "export");
  const [ledger, setLedger] = useState<AdminCommissionLedgerRowDto[]>([]);
  const [stats, setStats] = useState<AdminCommissionStatsDto | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [usingMockLedger, setUsingMockLedger] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CommissionLedgerStatus | "ALL">(
    "ALL",
  );
  const [pilotSearch, setPilotSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [missionSearch, setMissionSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutNotice, setPayoutNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load commission ledger.");
        setLedger([]);
        setStats(null);
      } else {
        setLedger(data.ledger ?? []);
        setStats(data.stats ?? null);
        setTotalEntries(data.totalEntries ?? data.ledger?.length ?? 0);
        setUsingMockLedger(Boolean(data.usingMockLedger));
      }
    } catch {
      setError("Failed to load commission ledger.");
      setLedger([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return ledger.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (!matchesSearch(row.pilotName, pilotSearch)) return false;
      if (!matchesSearch(row.clientName, clientSearch)) return false;
      if (!matchesSearch(row.missionId, missionSearch)) return false;
      return true;
    });
  }, [ledger, statusFilter, pilotSearch, clientSearch, missionSearch]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, pilotSearch, clientSearch, missionSearch]);

  const displayTotal = usingMockLedger ? totalEntries : filteredRows.length;
  const totalPages = usingMockLedger
    ? Math.max(1, Math.ceil(displayTotal / PAGE_SIZE))
    : Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = usingMockLedger
    ? currentPage === 1
      ? filteredRows.slice(0, PAGE_SIZE)
      : []
    : filteredRows.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      );

  function handleExportCsv() {
    if (filteredRows.length === 0) return;
    downloadCommissionLedgerCsv(filteredRows);
  }

  function handleRunPayoutsConfirm() {
    setPayoutNotice(
      "Payout execution backend is pending. No live payouts were processed.",
    );
  }

  const currency = stats?.currency ?? "USD";

  return (
    <div className="admin-commissions-page">
      <section
        className="admin-commissions-hero admin-ops-bracket-card"
        aria-label="Pilot commissions"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-commissions-hero-inner">
          <div className="admin-commissions-hero-copy">
            <p className="admin-ops-eyebrow">COMMISSION LEDGER</p>
            <h1 className="admin-commissions-hero-title">Pilot Commissions</h1>
            <p className="admin-commissions-hero-desc">
              Live tracking of every 10% commission earned by the platform, broken
              down per mission.
            </p>
          </div>
          {canRunPayouts ? (
            <button
              type="button"
              className="admin-commissions-btn-run"
              onClick={() => {
                setPayoutNotice(null);
                setShowPayoutModal(true);
              }}
            >
              RUN PAYOUTS
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="admin-commissions-banner admin-commissions-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {usingMockLedger ? (
        <p className="admin-commissions-banner admin-commissions-banner--info" role="status">
          Showing sample ledger rows until completed booking payments exist in the database.
        </p>
      ) : null}

      {stats ? (
        <section className="admin-commissions-stats-grid" aria-label="Commission metrics">
          <article className="admin-commissions-stat-card">
            <p className="admin-commissions-stat-label">COMMISSION MTD</p>
            <p className="admin-commissions-stat-value">
              {formatCommissionMoney(stats.commissionMtd, currency)}
            </p>
            <p
              className={`admin-commissions-stat-sub${
                isPositiveGrowthSubtext(stats.commissionMtdSubtext)
                  ? " admin-commissions-stat-sub--success"
                  : ""
              }`}
            >
              {stats.commissionMtdSubtext}
            </p>
          </article>
          <article className="admin-commissions-stat-card">
            <p className="admin-commissions-stat-label">COMMISSION RATE</p>
            <p className="admin-commissions-stat-value">10%</p>
            <p className="admin-commissions-stat-sub">{stats.commissionRateSubtext}</p>
          </article>
          <article className="admin-commissions-stat-card">
            <p className="admin-commissions-stat-label">PENDING PAYOUTS</p>
            <p className="admin-commissions-stat-value">
              {formatCommissionMoney(stats.pendingPayouts, currency)}
            </p>
            <p className="admin-commissions-stat-sub">{stats.pendingPayoutsSubtext}</p>
          </article>
          <article className="admin-commissions-stat-card">
            <p className="admin-commissions-stat-label">SETTLED (30D)</p>
            <p className="admin-commissions-stat-value">
              {formatCommissionMoney(stats.settled30d, currency)}
            </p>
            <p
              className={`admin-commissions-stat-sub${
                isPositiveGrowthSubtext(stats.settled30dSubtext)
                  ? " admin-commissions-stat-sub--success"
                  : ""
              }`}
            >
              {stats.settled30dSubtext}
            </p>
          </article>
        </section>
      ) : null}

      <section className="admin-commissions-ledger" aria-label="Transaction ledger">
        <div className="admin-commissions-ledger-head">
          <div>
            <h2 className="admin-commissions-ledger-title">TRANSACTION LEDGER</h2>
            <p className="admin-commissions-ledger-sub">
              Fixed 10% platform commission on completed missions
            </p>
          </div>
          <div className="admin-commissions-ledger-actions">
            {canExport ? (
              <button
                type="button"
                className="admin-commissions-ledger-btn"
                onClick={handleExportCsv}
                disabled={filteredRows.length === 0}
              >
                EXPORT CSV
              </button>
            ) : null}
            <button
              type="button"
              className={`admin-commissions-ledger-btn${
                showFilters ? " admin-commissions-ledger-btn--active" : ""
              }`}
              onClick={() => setShowFilters((value) => !value)}
            >
              FILTER
            </button>
          </div>
        </div>

        {showFilters ? (
          <div className="admin-commissions-filters">
            <div className="admin-commissions-filter-field">
              <label htmlFor="commission-status-filter">Status</label>
              <select
                id="commission-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as CommissionLedgerStatus | "ALL")
                }
              >
                {ALL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL" ? "All" : status}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-commissions-filter-field">
              <label htmlFor="commission-pilot-search">Pilot</label>
              <input
                id="commission-pilot-search"
                value={pilotSearch}
                onChange={(event) => setPilotSearch(event.target.value)}
                placeholder="Search pilot"
              />
            </div>
            <div className="admin-commissions-filter-field">
              <label htmlFor="commission-client-search">Client</label>
              <input
                id="commission-client-search"
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder="Search client"
              />
            </div>
            <div className="admin-commissions-filter-field">
              <label htmlFor="commission-mission-search">Mission ID</label>
              <input
                id="commission-mission-search"
                value={missionSearch}
                onChange={(event) => setMissionSearch(event.target.value)}
                placeholder="MIS-####"
              />
            </div>
          </div>
        ) : null}

        {loading ? (
          <p className="admin-commissions-loading">Loading commission ledger…</p>
        ) : pageRows.length === 0 ? (
          <p className="admin-commissions-loading">No ledger entries match your filters.</p>
        ) : (
          <>
            <div className="admin-commissions-table-wrap">
              <table className="admin-commissions-table">
                <thead>
                  <tr>
                    <th scope="col">MISSION</th>
                    <th scope="col">PILOT</th>
                    <th scope="col">CLIENT</th>
                    <th scope="col">GROSS</th>
                    <th scope="col">RATE</th>
                    <th scope="col">COMMISSION</th>
                    <th scope="col">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr key={row.id}>
                      <td className="admin-commissions-cell-mission">{row.missionId}</td>
                      <td className="admin-commissions-cell-name">{row.pilotName}</td>
                      <td>{row.clientName}</td>
                      <td className="admin-commissions-cell-gross">
                        {formatCommissionMoney(row.amountGross, row.currency)}
                      </td>
                      <td className="admin-commissions-cell-rate">10%</td>
                      <td className="admin-commissions-cell-commission">
                        {formatCommissionMoney(row.commissionAmount, row.currency)}
                      </td>
                      <td>
                        <span className={statusClass(row.status)}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-commissions-mobile-list">
              {pageRows.map((row) => (
                <article key={row.id} className="admin-commissions-mobile-row">
                  <div className="admin-commissions-mobile-top">
                    <span className="admin-commissions-cell-mission">{row.missionId}</span>
                    <span className={statusClass(row.status)}>{row.status}</span>
                  </div>
                  <div className="admin-commissions-mobile-grid">
                    <div>
                      <strong>Pilot:</strong> {row.pilotName}
                    </div>
                    <div>
                      <strong>Client:</strong> {row.clientName}
                    </div>
                    <div>
                      <strong>Gross:</strong>{" "}
                      {formatCommissionMoney(row.amountGross, row.currency)}
                    </div>
                    <div>
                      <strong>Rate:</strong> 10% ·{" "}
                      <strong>Commission:</strong>{" "}
                      {formatCommissionMoney(row.commissionAmount, row.currency)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <footer className="admin-commissions-footer">
          <p className="admin-commissions-footer-meta">
            SHOWING {pageRows.length} OF {displayTotal} ENTRIES
          </p>
          <nav className="admin-commissions-pagination" aria-label="Ledger pagination">
            <button
              type="button"
              className="admin-commissions-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              PREVIOUS
            </button>
            {getPaginationItems(currentPage, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="admin-commissions-footer-meta">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={`admin-commissions-page-btn${
                    item === currentPage ? " admin-commissions-page-btn--active" : ""
                  }`}
                  onClick={() => setPage(item)}
                >
                  {item.toString().padStart(2, "0")}
                </button>
              ),
            )}
            <button
              type="button"
              className="admin-commissions-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              NEXT
            </button>
          </nav>
        </footer>
      </section>

      {showPayoutModal ? (
        <AdminRunPayoutsModal
          pendingMessage={payoutNotice}
          onClose={() => {
            setShowPayoutModal(false);
            setPayoutNotice(null);
          }}
          onConfirm={handleRunPayoutsConfirm}
        />
      ) : null}
    </div>
  );
}
