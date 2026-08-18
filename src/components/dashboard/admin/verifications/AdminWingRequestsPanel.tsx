"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import { approvalStatusFilterTabs } from "@/lib/ui/status-filter-tabs";
import type { AdminAviatorWingRequestDto } from "@/lib/wings/aviator-wing-requests";
import type { AviatorWingRequestStatus } from "@/lib/wings/request-wings";

const FILTERS = approvalStatusFilterTabs({
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
});

type AdminWingRequestsPanelProps = {
  pendingCount: number;
};

function fileHref(requestId: string, storedFileName: string) {
  return `/api/admin/wing-requests/${requestId}/document?file=${encodeURIComponent(storedFileName)}`;
}

export function AdminWingRequestsPanel({ pendingCount }: AdminWingRequestsPanelProps) {
  const { canPerform } = useModeratorPermissions();
  const canApprove = canPerform("verifications", "approve");
  const canReject = canPerform("verifications", "reject");

  const [filter, setFilter] = useState<AviatorWingRequestStatus | "all">("pending");
  const [rows, setRows] = useState<AdminAviatorWingRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/wing-requests?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load wings requests.");
        setRows([]);
      } else {
        setRows((data.requests ?? []) as AdminAviatorWingRequestDto[]);
      }
    } catch {
      setError("Failed to load wings requests.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0] ?? null,
    [rows, selectedId],
  );

  useEffect(() => {
    if (!selected) {
      setSelectedId(null);
      return;
    }
    setSelectedId(selected.id);
  }, [selected]);

  async function approve(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/wing-requests/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Approve failed.");
        return;
      }
      await load();
    } catch {
      setError("Approve failed.");
    } finally {
      setBusy(false);
    }
  }

  async function reject(id: string) {
    if (reason.trim().length < 5) {
      setError("Enter at least 5 characters explaining the denial.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/wing-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reject failed.");
        return;
      }
      setReason("");
      await load();
    } catch {
      setError("Reject failed.");
    } finally {
      setBusy(false);
    }
  }

  const files = selected
    ? [
        selected.documents.iacra,
        selected.documents.testScore,
        selected.documents.certificate,
        ...selected.documents.logbooks,
      ].filter((file): file is NonNullable<typeof file> => Boolean(file))
    : [];

  return (
    <div className="av-grid">
      <section className="av-queue" aria-label="Wings request queue">
        <div className="av-queue-head">
          <h2 className="av-queue-title">Wings Requests</h2>
          <span className="av-queue-sort">
            {loading ? pendingCount : rows.length} in this queue
          </span>
        </div>
        <div className="av-queue-filters" role="tablist" aria-label="Status filter">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              className={`av-filter${filter === item.value ? " av-filter--active" : ""}`}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {error && !selected ? (
          <p className="av-error" role="alert">
            {error}
          </p>
        ) : null}
        {loading ? (
          <p className="av-empty">Loading wings requests…</p>
        ) : rows.length === 0 ? (
          <p className="av-empty">No wings requests in this queue.</p>
        ) : (
          <ul className="av-queue-list">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className={`av-card${row.id === selected?.id ? " av-card--active" : ""}`}
                  onClick={() => setSelectedId(row.id)}
                >
                  <span className="av-card-row">
                    <span className="av-card-code">{row.wingLabel}</span>
                    <span className={`av-tag av-tag--${row.status === "pending" ? "pending" : row.status === "approved" ? "verified" : "missing"}`}>
                      {row.status}
                    </span>
                  </span>
                  <span className="av-card-name">{row.pilot.displayName}</span>
                  <span className="av-card-meta">{row.pilot.email}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="av-detail" aria-label="Wings request detail">
        {!selected ? (
          <p className="av-empty">Select a request to review evidence.</p>
        ) : (
          <>
            <h2 className="av-detail-title">{selected.pilot.displayName}</h2>
            <p className="av-detail-meta">
              {selected.wingLabel} · {selected.legalName}
              {selected.totalHours != null ? ` · ${selected.totalHours} hours` : ""}
              {selected.ftn ? ` · FTN ${selected.ftn}` : ""}
            </p>
            {selected.notes ? <p className="av-detail-notes">{selected.notes}</p> : null}
            {error ? (
              <p className="av-error" role="alert">
                {error}
              </p>
            ) : null}
            <ul className="av-doc-list">
              {files.length === 0 ? (
                <li className="av-empty">No files attached.</li>
              ) : (
                files.map((file) => (
                  <li key={file.id}>
                    <a href={fileHref(selected.id, file.storedFileName)} target="_blank" rel="noreferrer">
                      {file.slot}: {file.originalFileName}
                    </a>
                  </li>
                ))
              )}
            </ul>
            {selected.status === "pending" ? (
              <div className="av-detail-actions">
                {canApprove ? (
                  <button
                    type="button"
                    className="av-btn av-btn--approve"
                    disabled={busy}
                    onClick={() => void approve(selected.id)}
                  >
                    Award wings
                  </button>
                ) : null}
                {canReject ? (
                  <div className="av-reason">
                    <textarea
                      className="av-reason-input"
                      placeholder="Denial reason (min 5 characters)"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    />
                    <button
                      type="button"
                      className="av-btn av-btn--reject"
                      disabled={busy}
                      onClick={() => void reject(selected.id)}
                    >
                      Deny / request updates
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
