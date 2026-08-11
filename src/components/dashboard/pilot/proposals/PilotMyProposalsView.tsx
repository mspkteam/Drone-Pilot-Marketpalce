"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PilotProposalStatusBadge } from "@/components/dashboard/pilot/proposals/PilotProposalStatusBadge";
import {
  countProposalsByStatus,
  mapApplicationToProposalRow,
  PILOT_PROPOSAL_TAB_ORDER,
  type PilotProposalRow,
  type PilotProposalUiStatus,
} from "@/lib/pilot/proposals-map";
import type { PilotApplicationListItemDto } from "@/types/application";

const APPLICATIONS_API = "/api/pilot/applications" as const;

export function PilotMyProposalsView() {
  const [applications, setApplications] = useState<PilotApplicationListItemDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PilotProposalUiStatus>("PENDING");

  useEffect(() => {
    fetch(APPLICATIONS_API)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setApplications([]);
        } else {
          setApplications(data.applications ?? []);
        }
      })
      .catch(() => {
        setError("Failed to load proposals.");
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(
    () => applications.map(mapApplicationToProposalRow),
    [applications],
  );

  const counts = useMemo(() => countProposalsByStatus(rows), [rows]);

  const filteredRows = useMemo(
    () => rows.filter((row) => row.status === activeTab),
    [rows, activeTab],
  );

  if (loading) {
    return <p className="pilot-proposals-muted">Loading proposals…</p>;
  }

  return (
    <div className="pilot-proposals-page">
      <header className="pilot-proposals-header pilot-proposals-bracket-card">
        <p className="pilot-proposals-eyebrow">OPERATIONS / PROPOSALS</p>
        <h1 className="pilot-proposals-title">My Proposals</h1>
      </header>

      {error ? (
        <p className="pilot-proposals-banner pilot-proposals-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {rows.length === 0 && !error ? (
        <p className="pilot-proposals-banner" role="status">
          No proposals yet. Browse the marketplace and submit your first bid.
        </p>
      ) : null}

      <div className="pilot-proposals-tabs-wrap">
        <div className="pilot-proposals-tabs" role="tablist" aria-label="Proposal status">
          {PILOT_PROPOSAL_TAB_ORDER.map((status) => {
            const label = status === "REVISED" ? "Revised" : status;
            const count = counts[status];
            const isActive = activeTab === status;
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={
                  isActive
                    ? "pilot-proposals-tab pilot-proposals-tab--active"
                    : "pilot-proposals-tab"
                }
                onClick={() => setActiveTab(status)}
              >
                {label} - {count}
              </button>
            );
          })}
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="pilot-proposals-empty">
          <h2 className="pilot-proposals-empty-title">No proposals found</h2>
          <p className="pilot-proposals-muted">
            Proposals with this status will appear here.
          </p>
          {activeTab === "PENDING" && rows.length === 0 ? (
            <Link href="/dashboard/pilot/jobs" className="pilot-proposals-empty-link">
              Browse marketplace →
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="pilot-proposals-table-wrap">
          <table className="pilot-proposals-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">MISSION</th>
                <th scope="col">CLIENT</th>
                <th scope="col">BID</th>
                <th scope="col">SENT</th>
                <th scope="col">STATUS</th>
                <th scope="col">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <ProposalTableRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProposalTableRow({ row }: { row: PilotProposalRow }) {
  return (
    <tr>
      <td className="pilot-proposals-cell-id">{row.displayId}</td>
      <td className="pilot-proposals-cell-mission">{row.mission}</td>
      <td className="pilot-proposals-cell-client">{row.client}</td>
      <td className="pilot-proposals-cell-bid">{row.bid}</td>
      <td className="pilot-proposals-cell-sent">{row.sent}</td>
      <td>
        <PilotProposalStatusBadge status={row.status} label={row.badgeLabel} />
      </td>
      <td className="pilot-proposals-cell-action">
        <Link href={row.viewHref} className="pilot-proposals-view-link">
          VIEW →
        </Link>
      </td>
    </tr>
  );
}
