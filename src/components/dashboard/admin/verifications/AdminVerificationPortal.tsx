"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CreditCard,
  FileText,
  MessageSquare,
  Search,
  Shield,
  X,
  type LucideIcon,
} from "lucide-react";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import { getVerificationTypeLabel } from "@/lib/verification/status";
import { approvalStatusFilterTabs } from "@/lib/ui/status-filter-tabs";
import { AdminWingRequestsPanel } from "./AdminWingRequestsPanel";
import type {
  AdminVerificationDto,
  VerificationStatus,
  VerificationType,
} from "@/types/verification";

type AdminVerificationPortalProps = {
  pendingCount: number;
  pendingWingCount: number;
};

type Applicant = {
  pilot: AdminVerificationDto["pilot"];
  verifications: AdminVerificationDto[];
  earliestSubmitted: number;
  pendingCount: number;
  summary: "pending" | "missing" | "verified";
};

const FILTERS = approvalStatusFilterTabs({
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
});

const DOC_ICON: Record<VerificationType, LucideIcon> = {
  license: FileText,
  insurance: Shield,
  identity: CreditCard,
  other: FileText,
};

function appCode(pilotId: string): string {
  let hash = 0;
  for (let i = 0; i < pilotId.length; i += 1) {
    hash = (hash * 31 + pilotId.charCodeAt(i)) % 90000;
  }
  return `APP-${(hash + 10000).toString().padStart(5, "0")}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function docStatusTone(status: VerificationStatus): "verified" | "pending" | "danger" {
  if (status === "approved") return "verified";
  if (status === "rejected" || status === "expired") return "danger";
  return "pending";
}

function docStatusLabel(status: VerificationStatus): string {
  if (status === "approved") return "Verified";
  if (status === "rejected") return "Rejected";
  if (status === "expired") return "Expired";
  return "Pending";
}

function buildApplicants(rows: AdminVerificationDto[]): Applicant[] {
  const groups = new Map<string, Applicant>();

  for (const row of rows) {
    const existing = groups.get(row.pilot.id);
    const submitted = new Date(row.submittedAt).getTime();
    if (existing) {
      existing.verifications.push(row);
      existing.earliestSubmitted = Math.min(existing.earliestSubmitted, submitted);
    } else {
      groups.set(row.pilot.id, {
        pilot: row.pilot,
        verifications: [row],
        earliestSubmitted: submitted,
        pendingCount: 0,
        summary: "verified",
      });
    }
  }

  const applicants = Array.from(groups.values());
  for (const applicant of applicants) {
    applicant.verifications.sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );
    const pending = applicant.verifications.filter((v) => v.status === "pending");
    const rejected = applicant.verifications.filter(
      (v) => v.status === "rejected" || v.status === "expired",
    );
    applicant.pendingCount = pending.length;
    if (pending.length > 0) applicant.summary = "pending";
    else if (rejected.length > 0) applicant.summary = "missing";
    else applicant.summary = "verified";
  }

  applicants.sort((a, b) => a.earliestSubmitted - b.earliestSubmitted);
  return applicants;
}

function regionOf(pilot: AdminVerificationDto["pilot"]): string {
  return (
    [pilot.locationRegion, pilot.locationCountry].filter(Boolean).join(", ") || "—"
  );
}

function insuranceStatus(verifications: AdminVerificationDto[]): string {
  const insurance = verifications.find((v) => v.type === "insurance");
  if (!insurance) return "NOT SUBMITTED";
  return docStatusLabel(insurance.status).toUpperCase();
}

export function AdminVerificationPortal({
  pendingCount,
  pendingWingCount,
}: AdminVerificationPortalProps) {
  const { canPerform } = useModeratorPermissions();
  const canApprove = canPerform("verifications", "approve");
  const canReject = canPerform("verifications", "reject");

  const [queue, setQueue] = useState<"documents" | "wings">("documents");

  const [filter, setFilter] = useState<VerificationStatus | "all">("pending");
  const [rows, setRows] = useState<AdminVerificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reasonMode, setReasonMode] = useState<"reject" | "request" | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verifications?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load verifications.");
        setRows([]);
      } else {
        setRows(data.verifications ?? []);
      }
    } catch {
      setError("Failed to load verifications.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const applicants = useMemo(() => buildApplicants(rows), [rows]);

  useEffect(() => {
    if (applicants.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && applicants.some((a) => a.pilot.id === prev) ? prev : applicants[0].pilot.id,
    );
  }, [applicants]);

  const selected = useMemo(
    () => applicants.find((a) => a.pilot.id === selectedId) ?? null,
    [applicants, selectedId],
  );

  const awaitingCount = useMemo(
    () => (filter === "pending" ? applicants.length : applicants.filter((a) => a.pendingCount > 0).length),
    [applicants, filter],
  );

  const heroCount = loading ? pendingCount : awaitingCount;

  const selectApplicant = useCallback((id: string) => {
    setSelectedId(id);
    setReasonMode(null);
    setReason("");
    setError(null);
  }, []);

  async function approveApplicant(applicant: Applicant) {
    const pending = applicant.verifications.filter((v) => v.status === "pending");
    if (pending.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const v of pending) {
        const res = await fetch(`/api/admin/verifications/${v.id}/approve`, {
          method: "POST",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Approve failed.");
          break;
        }
      }
      await load();
    } catch {
      setError("Approve failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReason(applicant: Applicant) {
    if (reason.trim().length < 5) {
      setError("Enter at least 5 characters explaining what's needed.");
      return;
    }
    const pending = applicant.verifications.filter((v) => v.status === "pending");
    if (pending.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const v of pending) {
        const res = await fetch(`/api/admin/verifications/${v.id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason.trim() }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Action failed.");
          break;
        }
      }
      setReasonMode(null);
      setReason("");
      await load();
    } catch {
      setError("Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="av-root">
      <section className="av-hero admin-ops-bracket-card" aria-label="Pilot verification">
        <div className="admin-ops-hero-glow" aria-hidden />
        <p className="av-hero-eyebrow">Verification Queue</p>
        <h1 className="av-hero-title">Remote Aviator Verification</h1>
        <p className="av-hero-desc">
          {queue === "wings"
            ? `${pendingWingCount} wings request${pendingWingCount === 1 ? "" : "s"} awaiting review.`
            : `${heroCount} application${heroCount === 1 ? "" : "s"} awaiting your review. Approving a pilot grants them access to bid on missions.`}
        </p>
      </section>

      <div className="av-queue-filters av-section-tabs" role="tablist" aria-label="Verification queues">
        <button
          type="button"
          role="tab"
          aria-selected={queue === "documents"}
          className={`av-filter${queue === "documents" ? " av-filter--active" : ""}`}
          onClick={() => setQueue("documents")}
        >
          Documents
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={queue === "wings"}
          className={`av-filter${queue === "wings" ? " av-filter--active" : ""}`}
          onClick={() => setQueue("wings")}
        >
          Wings requests{pendingWingCount > 0 ? ` (${pendingWingCount})` : ""}
        </button>
      </div>

      {queue === "wings" ? (
        <AdminWingRequestsPanel pendingCount={pendingWingCount} />
      ) : (
      <div className="av-grid">
        <section className="av-queue" aria-label="Application queue">
          <div className="av-queue-head">
            <h2 className="av-queue-title">Application Queue</h2>
            <span className="av-queue-sort">Sorted by oldest first</span>
          </div>

          <div className="av-queue-filters" role="tablist" aria-label="Status filter">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                className={`av-filter${filter === f.value ? " av-filter--active" : ""}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
            <button
              type="button"
              className="av-filter av-filter--refresh"
              onClick={() => void load()}
            >
              Refresh
            </button>
          </div>

          {error && !selected ? (
            <p className="av-error" role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="av-empty">Loading applications…</p>
          ) : applicants.length === 0 ? (
            <p className="av-empty">No applications in this queue.</p>
          ) : (
            <ul className="av-queue-list">
              {applicants.map((applicant) => {
                const active = applicant.pilot.id === selectedId;
                const primaryType = applicant.verifications[0]?.type ?? "other";
                return (
                  <li key={applicant.pilot.id}>
                    <button
                      type="button"
                      className={`av-card${active ? " av-card--active" : ""}`}
                      onClick={() => selectApplicant(applicant.pilot.id)}
                      aria-pressed={active}
                    >
                      <span className="av-card-row">
                        <span className="av-card-code">{appCode(applicant.pilot.id)}</span>
                        <span className={`av-tag av-tag--${applicant.summary}`}>
                          {applicant.summary === "pending"
                            ? "Pending Review"
                            : applicant.summary === "missing"
                              ? "Needs Updates"
                              : "Verified"}
                        </span>
                      </span>
                      <span className="av-card-name">{applicant.pilot.displayName}</span>
                      <span className="av-card-foot">
                        <span className="av-card-foot-left">
                          <span className="av-card-license">
                            {getVerificationTypeLabel(primaryType)}
                          </span>
                          <span className="av-card-submitted">
                            Submitted {relativeTime(new Date(applicant.earliestSubmitted).toISOString())}
                          </span>
                        </span>
                        <span className="av-card-metric">
                          {applicant.verifications.length} doc
                          {applicant.verifications.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="av-detail" aria-label="Applicant detail">
          {!selected ? (
            <div className="av-detail-empty">
              <p className="av-empty">Select an application to review its documents.</p>
            </div>
          ) : (
            <>
              <div className="av-profile">
                <div className="av-profile-identity">
                  <div className="av-profile-identity-head">
                    <h2 className="av-profile-eyebrow">Applicant Profile</h2>
                    <p className="av-profile-code">
                      {appCode(selected.pilot.id)} • {selected.pilot.displayName}
                    </p>
                  </div>
                  <div className="av-avatar-wrap">
                    <div className="av-avatar-glow" aria-hidden />
                    <div className="av-avatar">
                      <div className="av-avatar-inner">
                        <span className="av-avatar-initials">
                          {initials(selected.pilot.displayName)}
                        </span>
                      </div>
                    </div>
                    <p className="av-avatar-name">{selected.pilot.displayName}</p>
                    <p className="av-avatar-callsign">{selected.pilot.email}</p>
                  </div>
                </div>

                <dl className="av-profile-facts">
                  <div className="av-fact">
                    <dt>FAA Certificate</dt>
                    <dd>{selected.pilot.licenseNumber || "—"}</dd>
                  </div>
                  <div className="av-fact">
                    <dt>License Country</dt>
                    <dd>{selected.pilot.licenseCountry || "—"}</dd>
                  </div>
                  <div className="av-fact">
                    <dt>Insurance Policy</dt>
                    <dd>{insuranceStatus(selected.verifications)}</dd>
                  </div>
                  <div className="av-fact">
                    <dt>Requested Region</dt>
                    <dd>{regionOf(selected.pilot)}</dd>
                  </div>
                  <div className="av-fact">
                    <dt>Documents</dt>
                    <dd>
                      {
                        selected.verifications.filter((v) => v.status === "approved")
                          .length
                      }{" "}
                      / {selected.verifications.length} verified
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="av-docs">
                <h2 className="av-docs-title">Required Documents</h2>
                <div className="av-docs-grid">
                  {selected.verifications.map((v) => {
                    const Icon = DOC_ICON[v.type];
                    const tone = docStatusTone(v.status);
                    const href = v.hasUploadedDocument
                      ? `/api/admin/verifications/${v.id}/document`
                      : v.documentUrl;
                    return (
                      <div key={v.id} className={`av-doc av-doc--${tone}`}>
                        {href ? (
                          <a
                            className="av-doc-view"
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${getVerificationTypeLabel(v.type)} document`}
                          >
                            <Search size={12} strokeWidth={2} aria-hidden />
                          </a>
                        ) : null}
                        <Icon className="av-doc-icon" size={26} strokeWidth={1.5} aria-hidden />
                        <p className="av-doc-label">{getVerificationTypeLabel(v.type)}</p>
                        <span className={`av-doc-status av-doc-status--${tone}`}>
                          {docStatusLabel(v.status)}
                        </span>
                      </div>
                    );
                  })}
                  {selected.verifications.length === 0 ? (
                    <p className="av-empty">No documents submitted.</p>
                  ) : null}
                </div>

                {error && selected ? (
                  <p className="av-error" role="alert">
                    {error}
                  </p>
                ) : null}

                {reasonMode ? (
                  <div className="av-reason">
                    <label className="av-reason-label" htmlFor="av-reason-input">
                      {reasonMode === "reject"
                        ? "Reason for rejection"
                        : "What additional information is required?"}
                    </label>
                    <textarea
                      id="av-reason-input"
                      className="av-reason-input"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Shared with the pilot so they can respond."
                    />
                    <div className="av-reason-actions">
                      <button
                        type="button"
                        className="av-btn av-btn--reject"
                        disabled={busy}
                        onClick={() => void submitReason(selected)}
                      >
                        {busy
                          ? "Sending…"
                          : reasonMode === "reject"
                            ? "Confirm rejection"
                            : "Send request"}
                      </button>
                      <button
                        type="button"
                        className="av-btn av-btn--ghost"
                        disabled={busy}
                        onClick={() => {
                          setReasonMode(null);
                          setReason("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {selected.pendingCount > 0 && !reasonMode ? (
                  <div className="av-actions">
                    {canReject ? (
                      <button
                        type="button"
                        className="av-btn av-btn--reject"
                        disabled={busy}
                        onClick={() => {
                          setReasonMode("reject");
                          setReason("");
                          setError(null);
                        }}
                      >
                        <X size={13} strokeWidth={2.5} aria-hidden />
                        Reject Application
                      </button>
                    ) : null}
                    {canReject ? (
                      <button
                        type="button"
                        className="av-btn av-btn--outline"
                        disabled={busy}
                        onClick={() => {
                          setReasonMode("request");
                          setReason("");
                          setError(null);
                        }}
                      >
                        <MessageSquare size={14} strokeWidth={2} aria-hidden />
                        Request More Info
                      </button>
                    ) : null}
                    {canApprove ? (
                      <button
                        type="button"
                        className="av-btn av-btn--approve"
                        disabled={busy}
                        onClick={() => void approveApplicant(selected)}
                      >
                        <Check size={14} strokeWidth={2.5} aria-hidden />
                        {busy ? "Approving…" : "Approve Pilot"}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {selected.pendingCount === 0 && !reasonMode ? (
                  <p className="av-resolved">
                    No pending documents for this applicant.
                  </p>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
      )}
    </div>
  );
}
