"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BACKGROUND_CHECK_STATUS_LABELS,
  type AdminBackgroundCheckRowDto,
  type BackgroundCheckStatus,
} from "@/types/background-check";

const SETTABLE: BackgroundCheckStatus[] = [
  "paid",
  "in_review",
  "cleared",
  "not_cleared",
];

function fmt(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString() : "—";
}

function Row({
  row,
  onChange,
}: {
  row: AdminBackgroundCheckRowDto;
  onChange: (row: AdminBackgroundCheckRowDto) => void;
}) {
  const [status, setStatus] = useState<BackgroundCheckStatus>(row.status);
  const [cert, setCert] = useState(row.faaCertificateNumber ?? "");
  const [notes, setNotes] = useState(row.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(faaVerified: boolean) {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/background-checks/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        faaCertificateNumber: cert,
        adminNotes: notes,
        ...(faaVerified ? { faaVerified: true } : {}),
      }),
    });
    const data = (await res.json()) as {
      check?: AdminBackgroundCheckRowDto;
      error?: string;
    };
    if (!res.ok || !data.check) setError(data.error ?? "Save failed.");
    else onChange(data.check);
    setSaving(false);
  }

  return (
    <tr>
      <td>
        <strong>{row.pilotName}</strong>
        <div className="bgc-muted">{row.pilotEmail}</div>
        <div className="bgc-muted">License: {row.licenseNumber}</div>
      </td>
      <td>
        <span className={`bgc-badge bgc-badge--${row.status}`}>
          {BACKGROUND_CHECK_STATUS_LABELS[row.status]}
        </span>
        <div className="bgc-muted">Paid {fmt(row.paidAt)}</div>
        <div className="bgc-muted">
          Due {fmt(row.deadlineAt)}
          {row.marketplacePaused ? " · paused" : ""}
        </div>
      </td>
      <td style={{ minWidth: 240 }}>
        <label className="bgc-field-label">Status</label>
        <select
          className="bgc-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as BackgroundCheckStatus)}
        >
          {SETTABLE.map((s) => (
            <option key={s} value={s}>
              {BACKGROUND_CHECK_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <label className="bgc-field-label">Notes</label>
        <textarea
          className="bgc-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </td>
      <td style={{ minWidth: 220 }}>
        <label className="bgc-field-label">FAA certificate #</label>
        <input
          className="bgc-input"
          value={cert}
          onChange={(e) => setCert(e.target.value)}
        />
        <div className="bgc-muted" style={{ marginTop: 6 }}>
          {row.faaVerifiedAt
            ? `Verified by ${row.faaVerifiedById} on ${fmt(row.faaVerifiedAt)}`
            : "Not verified"}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button
            type="button"
            className="bgc-btn"
            style={{ marginTop: 0 }}
            disabled={saving}
            onClick={() => void save(false)}
          >
            Save
          </button>
          <button
            type="button"
            className="bgc-btn bgc-btn--ghost"
            disabled={saving}
            onClick={() => void save(true)}
          >
            Save + mark FAA verified
          </button>
        </div>
        {error ? <p className="bgc-error">{error}</p> : null}
      </td>
    </tr>
  );
}

export function AdminBackgroundChecksPortal() {
  const [rows, setRows] = useState<AdminBackgroundCheckRowDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/background-checks");
    const data = (await res.json()) as {
      checks?: AdminBackgroundCheckRowDto[];
      error?: string;
    };
    if (!res.ok || !data.checks) setError(data.error ?? "Could not load.");
    else setRows(data.checks);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="bgc-root">
      <section className="bgc-card">
        <p className="bgc-eyebrow">Compliance</p>
        <h1 className="bgc-title">
          Pilot <span>Background Checks</span>
        </h1>
        <p className="bgc-text">
          Paid pilots awaiting manual review. Record the FAA license
          verification and set the outcome; pilots are notified on each status
          change.
        </p>
      </section>

      <section className="bgc-card">
        {error ? <p className="bgc-error">{error}</p> : null}
        {!rows && !error ? <p className="bgc-muted">Loading…</p> : null}
        {rows && rows.length === 0 ? (
          <p className="bgc-muted">No paid background checks yet.</p>
        ) : null}
        {rows && rows.length > 0 ? (
          <div className="bgc-table-wrap">
            <table className="bgc-table">
              <thead>
                <tr>
                  <th>Pilot</th>
                  <th>Status</th>
                  <th>Review</th>
                  <th>FAA verification</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <Row
                    key={row.id}
                    row={row}
                    onChange={(next) =>
                      setRows((prev) =>
                        prev ? prev.map((r) => (r.id === next.id ? next : r)) : prev,
                      )
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
