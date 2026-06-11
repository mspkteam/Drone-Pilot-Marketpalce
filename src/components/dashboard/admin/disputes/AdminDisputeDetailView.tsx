"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AdminDisputeResolveModal } from "@/components/dashboard/admin/disputes/AdminDisputeResolveModal";
import { AdminDisputeVoteModal } from "@/components/dashboard/admin/disputes/AdminDisputeVoteModal";
import {
  formatDisputeDisplayId,
  formatMissionDisplayId,
} from "@/lib/admin/dispute-center-filters";
import {
  getDisputeEntryTypeLabel,
  getDisputeResolutionLabel,
  getDisputeStatusLabel,
} from "@/lib/disputes/status";
import type { DisputeDetailDto } from "@/types/dispute";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import type { UserRole } from "@/types/roles";

type AdminDisputeDetailViewProps = {
  initialDispute: DisputeDetailDto;
  conversationId: string | null;
  viewerRole: UserRole;
};

export function AdminDisputeDetailView({
  initialDispute,
  conversationId,
  viewerRole,
}: AdminDisputeDetailViewProps) {
  const router = useRouter();
  const [dispute, setDispute] = useState(initialDispute);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);

  const { canPerform } = useModeratorPermissions();
  const canResolve = canPerform("disputes", "resolve");
  const clientName =
    dispute.booking.client.companyName ?? dispute.booking.client.contactName;

  const reload = useCallback(async () => {
    const res = await fetch(`/api/admin/disputes/${dispute.id}`);
    const data = await res.json();
    if (res.ok) {
      setDispute(data.dispute);
    }
  }, [dispute.id]);

  async function startReview() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${dispute.id}/review`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Review start failed.");
      } else {
        setDispute(data.dispute);
      }
    } catch {
      setError("Review start failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function addComment() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes/${dispute.id}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Comment failed.");
      } else {
        setComment("");
        await reload();
      }
    } catch {
      setError("Comment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-dispute-detail-page">
      <section
        className="admin-dispute-detail-hero admin-ops-bracket-card"
        aria-label="Dispute case"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-dispute-detail-hero-inner">
          <Link href="/dashboard/admin/disputes" className="admin-dispute-back">
            ← All disputes
          </Link>
          <p className="admin-ops-eyebrow">DISPUTE CASE</p>
          <div className="admin-dispute-detail-head-row">
            <div>
              <h1 className="admin-dispute-detail-title">
                {dispute.booking.job.title}
              </h1>
              <p className="admin-dispute-detail-subtitle">
                Review timeline, moderate, and resolve.
              </p>
            </div>
            <span
              className={`admin-dispute-status-badge admin-dispute-status-badge--${dispute.status}`}
            >
              {getDisputeStatusLabel(dispute.status).toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      <div className="admin-dispute-detail-layout">
        <div className="admin-dispute-detail-main">
          <section className="admin-dispute-panel">
            <h2 className="admin-dispute-panel-title">CASE SUMMARY</h2>
            <div className="admin-dispute-reason-block">
              <p className="admin-dispute-field-label">Initial reason</p>
              <p className="admin-dispute-reason-text">{dispute.reason}</p>
            </div>
          </section>

          <section className="admin-dispute-panel">
            <h2 className="admin-dispute-panel-title">CASE TIMELINE</h2>
            <ul className="admin-dispute-timeline">
              {dispute.entries.map((entry) => {
                const isModerator =
                  entry.authorRole === "super_admin" ||
                  entry.authorRole === "moderator";

                return (
                  <li
                    key={entry.id}
                    className={`admin-dispute-timeline-item${
                      isModerator ? " admin-dispute-timeline-item--moderator" : ""
                    }`}
                  >
                    <span className="admin-dispute-timeline-dot" aria-hidden />
                    <div className="admin-dispute-timeline-body">
                      <div className="admin-dispute-timeline-meta">
                        <span className="admin-dispute-timeline-author">
                          {entry.authorLabel}
                        </span>
                        <span>{getDisputeEntryTypeLabel(entry.entryType)}</span>
                        <time dateTime={entry.createdAt}>
                          {new Date(entry.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="admin-dispute-timeline-text">{entry.body}</p>
                      {entry.attachmentUrl ? (
                        <a
                          href={entry.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-dispute-timeline-link"
                        >
                          {entry.attachmentUrl}
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {error ? (
            <p className="admin-dispute-alert admin-dispute-alert--error" role="alert">
              {error}
            </p>
          ) : null}

          {dispute.canAddEntry ? (
            <section className="admin-dispute-panel">
              <h2 className="admin-dispute-panel-title">Moderator comment</h2>
              <label className="admin-dispute-field" htmlFor="mod-comment">
                <span className="admin-dispute-field-label">Comment</span>
                <textarea
                  id="mod-comment"
                  className="admin-dispute-textarea"
                  rows={4}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Comment"
                />
              </label>
              <button
                type="button"
                className="admin-dispute-btn admin-dispute-btn--gold"
                disabled={submitting || comment.trim().length < 2}
                onClick={() => void addComment()}
              >
                Post comment
              </button>
            </section>
          ) : null}

          {dispute.canStartReview ? (
            <button
              type="button"
              className="admin-dispute-btn admin-dispute-btn--outline"
              disabled={submitting}
              onClick={() => void startReview()}
            >
              Start review
            </button>
          ) : null}
        </div>

        <aside className="admin-dispute-detail-side">
          <section className="admin-dispute-side-card">
            <h2 className="admin-dispute-side-title">Case details</h2>
            <dl className="admin-dispute-side-fields">
              <div>
                <dt>Client</dt>
                <dd>{clientName}</dd>
              </div>
              <div>
                <dt>Pilot</dt>
                <dd>{dispute.booking.pilot.displayName}</dd>
              </div>
              <div>
                <dt>Agreed amount</dt>
                <dd>
                  ${dispute.booking.agreedAmount} {dispute.booking.currency}
                </dd>
              </div>
              <div>
                <dt>Opened by</dt>
                <dd>{dispute.openedByRole}</dd>
              </div>
              <div>
                <dt>Dispute ID</dt>
                <dd>{formatDisputeDisplayId(dispute.id)}</dd>
              </div>
              <div>
                <dt>Mission ID</dt>
                <dd>{formatMissionDisplayId(dispute.booking.job.id)}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-dispute-side-card">
            <h2 className="admin-dispute-side-title">Booking</h2>
            <p className="admin-dispute-side-copy">
              Status: <strong>{dispute.booking.status}</strong>
            </p>
            <Link
              href={`/dashboard/admin/bookings`}
              className="admin-dispute-side-link"
            >
              View bookings module
            </Link>
          </section>

          {conversationId ? (
            <section className="admin-dispute-side-card">
              <h2 className="admin-dispute-side-title">Related messages</h2>
              <p className="admin-dispute-side-copy">
                Read-only client–pilot conversation for this booking.
              </p>
              <Link
                href={`/dashboard/admin/messages/${conversationId}`}
                className="admin-dispute-side-link"
              >
                View related messages
              </Link>
            </section>
          ) : null}

          {dispute.resolutionType ? (
            <section className="admin-dispute-side-card admin-dispute-side-card--success">
              <h2 className="admin-dispute-side-title">Resolved</h2>
              <p className="admin-dispute-side-copy">
                {getDisputeResolutionLabel(dispute.resolutionType)}
                {dispute.resolutionAmount != null
                  ? ` — pilot payout $${dispute.resolutionAmount}`
                  : null}
              </p>
              {dispute.resolutionNotes ? (
                <p className="admin-dispute-side-copy">{dispute.resolutionNotes}</p>
              ) : null}
            </section>
          ) : (
            <section className="admin-dispute-side-card">
              <h2 className="admin-dispute-side-title">Actions</h2>
              <div className="admin-dispute-side-actions">
                <button
                  type="button"
                  className="admin-dispute-btn admin-dispute-btn--ghost"
                  onClick={() => setVoteOpen(true)}
                >
                  Send to squadron vote
                </button>
                {canResolve && dispute.canResolve ? (
                  <button
                    type="button"
                    className="admin-dispute-btn admin-dispute-btn--gold"
                    onClick={() => setResolveOpen(true)}
                  >
                    Resolve dispute
                  </button>
                ) : dispute.status === "under_review" && !canResolve ? (
                  <p className="admin-dispute-side-copy">
                    Your admin has not granted permission to resolve this dispute.
                  </p>
                ) : null}
              </div>
            </section>
          )}
        </aside>
      </div>

      <AdminDisputeVoteModal
        open={voteOpen}
        disputeLabel={formatDisputeDisplayId(dispute.id)}
        onCancel={() => setVoteOpen(false)}
      />

      <AdminDisputeResolveModal
        open={resolveOpen}
        disputeId={dispute.id}
        disputeLabel={formatDisputeDisplayId(dispute.id)}
        canResolve={dispute.canResolve}
        needsReview={dispute.status === "open"}
        onCancel={() => setResolveOpen(false)}
        onResolved={() => {
          setResolveOpen(false);
          void reload();
          router.refresh();
        }}
      />
    </div>
  );
}
