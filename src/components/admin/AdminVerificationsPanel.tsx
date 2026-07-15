"use client";

import { useCallback, useEffect, useState } from "react";
import { VerificationDocumentLink } from "@/components/verification/VerificationDocumentLink";
import { getVerificationTypeLabel } from "@/lib/verification/status";
import { approvalStatusFilterTabs } from "@/lib/ui/status-filter-tabs";
import type { AdminVerificationDto } from "@/types/verification";
import type { VerificationStatus } from "@/types/verification";

const FILTERS = approvalStatusFilterTabs({
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
});

function statusToneClass(status: VerificationStatus): string {
  if (status === "approved") return "admin-verifications-status--success";
  if (status === "rejected" || status === "expired") {
    return "admin-verifications-status--danger";
  }
  return "admin-verifications-status--pending";
}

function statusLabel(status: VerificationStatus): string {
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Expired";
}

export function AdminVerificationsPanel() {
  const [filter, setFilter] = useState<VerificationStatus | "all">("pending");
  const [verifications, setVerifications] = useState<AdminVerificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load verifications.");
        setVerifications([]);
      } else {
        setVerifications(data.verifications ?? []);
      }
    } catch {
      setError("Failed to load verifications.");
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approve(id: string) {
    setActingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Approve failed.");
      } else {
        setRejectId(null);
        await load();
      }
    } catch {
      setError("Approve failed.");
    } finally {
      setActingId(null);
    }
  }

  async function reject(id: string) {
    if (!rejectReason.trim()) {
      setError("Enter a rejection reason.");
      return;
    }
    setActingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Reject failed.");
      } else {
        setRejectId(null);
        setRejectReason("");
        await load();
      }
    } catch {
      setError("Reject failed.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="admin-verifications-queue">
      <div className="admin-verifications-toolbar">
        <div
          className="admin-verifications-filters"
          role="tablist"
          aria-label="Verification status filters"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              className={`admin-verifications-filter${
                filter === f.value ? " admin-verifications-filter--active" : ""
              }`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="admin-verifications-btn-outline"
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="admin-verifications-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="admin-verifications-empty">Loading verifications…</p>
      ) : verifications.length === 0 ? (
        <p className="admin-verifications-empty">
          No verifications in this queue.
        </p>
      ) : (
        <ul className="admin-verifications-list">
          {verifications.map((v) => (
            <li key={v.id} className="admin-verifications-card">
              <div className="admin-verifications-card-top">
                <div className="admin-verifications-card-copy">
                  <p className="admin-verifications-card-title">
                    {getVerificationTypeLabel(v.type)}
                    <span className="admin-verifications-card-sep">·</span>
                    {v.pilot.displayName}
                  </p>
                  <p className="admin-verifications-card-meta">
                    {v.pilot.email} · License {v.pilot.licenseNumber}
                  </p>
                  <div className="admin-verifications-doc">
                    <VerificationDocumentLink
                      verification={v}
                      audience="admin"
                    />
                  </div>
                  {v.notes ? (
                    <p className="admin-verifications-notes">Notes: {v.notes}</p>
                  ) : null}
                  <p className="admin-verifications-submitted">
                    Submitted {new Date(v.submittedAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`admin-verifications-status ${statusToneClass(v.status)}`}
                >
                  {statusLabel(v.status)}
                </span>
              </div>

              {v.status === "pending" ? (
                <div className="admin-verifications-card-actions">
                  <button
                    type="button"
                    className="admin-verifications-btn-primary"
                    disabled={actingId === v.id}
                    onClick={() => void approve(v.id)}
                  >
                    {actingId === v.id && rejectId !== v.id
                      ? "Approving…"
                      : "Approve"}
                  </button>
                  {rejectId === v.id ? (
                    <div className="admin-verifications-reject-row">
                      <label className="admin-verifications-field">
                        <span className="admin-verifications-field-label">
                          Rejection reason
                        </span>
                        <input
                          id={`reject-${v.id}`}
                          type="text"
                          className="admin-verifications-input"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Required if rejecting"
                        />
                      </label>
                      <button
                        type="button"
                        className="admin-verifications-btn-danger"
                        disabled={actingId === v.id}
                        onClick={() => void reject(v.id)}
                      >
                        Confirm reject
                      </button>
                      <button
                        type="button"
                        className="admin-verifications-btn-outline"
                        onClick={() => {
                          setRejectId(null);
                          setRejectReason("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="admin-verifications-btn-outline"
                      onClick={() => setRejectId(v.id)}
                    >
                      Reject
                    </button>
                  )}
                </div>
              ) : v.rejectionReason ? (
                <p className="admin-verifications-rejected">
                  Rejected: {v.rejectionReason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
