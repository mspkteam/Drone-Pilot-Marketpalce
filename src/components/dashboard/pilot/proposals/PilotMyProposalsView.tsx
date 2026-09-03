"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PilotProposalStatusBadge } from "@/components/dashboard/pilot/proposals/PilotProposalStatusBadge";
import {
  countProposalsByStatus,
  filterProposalsByTab,
  isProposalTabId,
  mapApplicationToProposalRow,
  PILOT_PROPOSAL_TAB_ORDER,
  proposalTabLabel,
  type PilotProposalRow,
  type PilotProposalTabId,
} from "@/lib/pilot/proposals-map";
import type { PilotApplicationListItemDto } from "@/types/application";

const APPLICATIONS_API = "/api/pilot/applications" as const;

export function PilotMyProposalsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("status");
  const activeTab: PilotProposalTabId = isProposalTabId(tabParam)
    ? tabParam
    : "ALL";

  const [applications, setApplications] = useState<PilotApplicationListItemDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    () => filterProposalsByTab(rows, activeTab),
    [rows, activeTab],
  );

  function setActiveTab(tab: PilotProposalTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "ALL") {
      params.delete("status");
    } else {
      params.set("status", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

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
        <div className="pilot-proposals-tabs" role="tablist" aria-label="Filter proposals by status">
          {PILOT_PROPOSAL_TAB_ORDER.map((status) => {
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
                <span>{proposalTabLabel(status)}</span>
                <span className="pilot-proposals-tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <div className="pilot-proposals-empty">
          <h2 className="pilot-proposals-empty-title">
            {rows.length === 0 ? "No proposals yet" : "No proposals in this filter"}
          </h2>
          <p className="pilot-proposals-muted">
            {rows.length === 0
              ? "Submit a bid from the marketplace and it will show up here."
              : `Nothing is marked ${proposalTabLabel(activeTab).toLowerCase()} yet. Try All to see every proposal.`}
          </p>
          {rows.length === 0 ? (
            <Link href="/dashboard/pilot/jobs" className="pilot-proposals-empty-link">
              Browse marketplace →
            </Link>
          ) : activeTab !== "ALL" ? (
            <button
              type="button"
              className="pilot-proposals-empty-link"
              onClick={() => setActiveTab("ALL")}
            >
              Show all proposals
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="pilot-proposals-table-wrap">
            <table className="pilot-proposals-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">MISSION</th>
                  <th scope="col">CLIENT</th>
                  <th scope="col">BID</th>
                  <th scope="col">SENT</th>
                  <th scope="col">CLIENT VIEW</th>
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

          <div className="pilot-proposals-cards">
            {filteredRows.map((row) => (
              <ProposalCard key={row.id} row={row} />
            ))}
          </div>
        </>
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
      <td className="pilot-proposals-cell-sent">{row.viewedLabel}</td>
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

function ProposalCard({ row }: { row: PilotProposalRow }) {
  return (
    <article className="pilot-proposals-card">
      <div className="pilot-proposals-card-top">
        <p className="pilot-proposals-cell-id">{row.displayId}</p>
        <PilotProposalStatusBadge status={row.status} label={row.badgeLabel} />
      </div>
      <h3 className="pilot-proposals-card-mission">{row.mission}</h3>
      <dl className="pilot-proposals-card-grid">
        <div>
          <dt>Client</dt>
          <dd>{row.client}</dd>
        </div>
        <div>
          <dt>Bid</dt>
          <dd>{row.bid}</dd>
        </div>
        <div>
          <dt>Sent</dt>
          <dd>{row.sent}</dd>
        </div>
        <div>
          <dt>Client view</dt>
          <dd>{row.viewedLabel}</dd>
        </div>
      </dl>
      <Link href={row.viewHref} className="pilot-proposals-view-link">
        VIEW →
      </Link>
    </article>
  );
}
