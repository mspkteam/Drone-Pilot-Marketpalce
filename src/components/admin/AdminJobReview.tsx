"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminJobApprovalModal } from "@/components/dashboard/admin/job-approval/AdminJobApprovalModal";
import { useModeratorPermissions } from "@/contexts/ModeratorPermissionsContext";
import {
  JOB_APPROVAL_VISIBILITY_STEPS,
  JOB_REJECTION_NEXT_STEPS,
} from "@/lib/admin/job-approval-next-steps";
import { canApproveJob, canRejectJob } from "@/lib/jobs/status";
import { JOB_CATEGORIES } from "@/types/job";
import type { AdminJobDto } from "@/types/admin-job";

function categoryLabel(id: string) {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function formatBudget(job: AdminJobDto): string {
  if (job.budgetMin == null && job.budgetMax == null) return "Not set";
  const min = job.budgetMin != null ? `$${job.budgetMin.toLocaleString()}` : "—";
  const max = job.budgetMax != null ? `$${job.budgetMax.toLocaleString()}` : "—";
  return `${min} – ${max} ${job.currency}`;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

type AdminJobReviewProps = {
  job: AdminJobDto;
};

export function AdminJobReview({ job }: AdminJobReviewProps) {
  const router = useRouter();
  const { canPerform } = useModeratorPermissions();
  const canApprove = canPerform("jobApproval", "approve");
  const canReject = canPerform("jobApproval", "reject");

  const [modalMode, setModalMode] = useState<"approve" | "reject" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState(job.rejectionReason);

  const pending = canApproveJob(job.status) && canRejectJob(job.status);
  const showApprove = pending && canApprove;
  const showReject = pending && canReject;

  async function handleConfirm(reason?: string) {
    if (!modalMode) return;
    setSubmitting(true);
    setModalError(null);

    const endpoint =
      modalMode === "approve"
        ? `/api/admin/jobs/${job.id}/approve`
        : `/api/admin/jobs/${job.id}/reject`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers:
        modalMode === "reject"
          ? { "Content-Type": "application/json" }
          : undefined,
      body:
        modalMode === "reject"
          ? JSON.stringify({ reason: reason ?? "" })
          : undefined,
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setModalError(data.error ?? "Action failed.");
      return;
    }

    if (modalMode === "reject") {
      setRejectionReason(reason ?? null);
    }
    setOutcome(modalMode);
    setModalMode(null);
    router.refresh();
  }

  return (
    <div className="admin-job-approval-page">
      <section
        className="admin-job-approval-hero admin-ops-bracket-card"
        aria-label="Mission review"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-job-approval-hero-copy">
          <Link href="/dashboard/admin/jobs" className="admin-job-approval-back">
            ← Back to Job Approval
          </Link>
          <p className="admin-ops-eyebrow">MISSION REVIEW</p>
          <h1 className="admin-job-approval-hero-title">{job.title}</h1>
          <p className="admin-job-approval-hero-desc">
            Full brief for moderation. Approve only after checking location, budget,
            requirements, and risk.
          </p>
          <div className="admin-job-approval-review-badges">
            <span className="admin-job-approval-status-pill">
              {statusLabel(outcome === "approve" ? "open" : outcome === "reject" ? "rejected" : job.status)}
            </span>
            <span className="admin-job-approval-mission-id">
              {job.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      {outcome ? (
        <section
          className={`admin-job-approval-outcome admin-job-approval-outcome--${outcome}`}
          role="status"
        >
          <h2 className="admin-job-approval-outcome-title">
            {outcome === "approve" ? "Mission approved" : "Mission rejected"}
          </h2>
          <p className="admin-job-approval-outcome-copy">
            {outcome === "approve"
              ? "The posting is Open. Grade-based visibility delays now apply."
              : "The client can edit and resubmit with your reason below."}
          </p>
          {outcome === "reject" && rejectionReason ? (
            <p className="admin-job-approval-outcome-reason">
              Reason sent to client: {rejectionReason}
            </p>
          ) : null}
          <ol className="admin-job-approval-next-steps-list">
            {(outcome === "approve"
              ? JOB_APPROVAL_VISIBILITY_STEPS
              : JOB_REJECTION_NEXT_STEPS
            ).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Link
            href="/dashboard/admin/jobs"
            className="admin-job-approval-btn admin-job-approval-btn--approve"
          >
            Return to queue
          </Link>
        </section>
      ) : null}

      <section className="admin-job-approval-panel" aria-label="Mission details">
        <div className="admin-job-approval-panel-head">
          <h2 className="admin-job-approval-panel-title">Mission brief</h2>
        </div>
        <div className="admin-job-approval-review-body">
          <p className="admin-job-approval-review-desc">{job.description}</p>

          <dl className="admin-job-approval-review-grid">
            <div>
              <dt>Category</dt>
              <dd>{categoryLabel(job.category)}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{job.locationLabel}</dd>
            </div>
            <div>
              <dt>Client</dt>
              <dd>
                {job.client.contactName}
                {job.client.companyName ? ` (${job.client.companyName})` : ""}
              </dd>
            </div>
            <div>
              <dt>Client email</dt>
              <dd>{job.client.email ?? "—"}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd className="admin-job-approval-budget">{formatBudget(job)}</dd>
            </div>
            <div>
              <dt>Preferred date</dt>
              <dd>
                {job.scheduledDate
                  ? new Date(job.scheduledDate).toLocaleDateString()
                  : "Flexible / not set"}
              </dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>
                {job.submittedAt
                  ? new Date(job.submittedAt).toLocaleString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{statusLabel(job.status)}</dd>
            </div>
          </dl>

          {job.requirements ? (
            <div className="admin-job-approval-review-block">
              <h3>Requirements</h3>
              <p>{job.requirements}</p>
            </div>
          ) : null}

          {job.rejectionReason && !outcome ? (
            <p className="admin-job-approval-prior-reject">
              Previous rejection: {job.rejectionReason}
            </p>
          ) : null}
        </div>

        {pending && !outcome ? (
          <div className="admin-job-approval-review-actions">
            <div className="admin-job-approval-next-steps admin-job-approval-next-steps--inline">
              <p className="admin-job-approval-next-steps-title">
                Decide with next steps in mind
              </p>
              <p className="admin-job-approval-review-hint">
                Approval starts grade visibility delays. Rejection returns the brief to
                the client with your reason — they can fix and resubmit.
              </p>
            </div>
            <div className="admin-job-approval-mission-actions">
              {showReject ? (
                <button
                  type="button"
                  className="admin-job-approval-btn admin-job-approval-btn--reject"
                  onClick={() => {
                    setModalError(null);
                    setModalMode("reject");
                  }}
                >
                  Reject
                </button>
              ) : null}
              {showApprove ? (
                <button
                  type="button"
                  className="admin-job-approval-btn admin-job-approval-btn--approve"
                  onClick={() => {
                    setModalError(null);
                    setModalMode("approve");
                  }}
                >
                  Approve
                </button>
              ) : null}
              {!showApprove && !showReject ? (
                <p className="admin-job-approval-review-hint">
                  You do not have permission to approve or reject this mission.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {!pending && !outcome ? (
          <div className="admin-job-approval-review-actions">
            <p className="admin-job-approval-review-hint">
              This mission has already been moderated. Open missions follow
              grade-based visibility in the pilot marketplace.
            </p>
            <Link
              href="/dashboard/admin/jobs"
              className="admin-job-approval-btn admin-job-approval-btn--ghost"
            >
              Back to queue
            </Link>
          </div>
        ) : null}
      </section>

      <AdminJobApprovalModal
        open={modalMode !== null}
        mode={modalMode ?? "approve"}
        missionTitle={job.title}
        missionId={job.id.slice(0, 8).toUpperCase()}
        submitting={submitting}
        error={modalError}
        onCancel={() => {
          if (!submitting) {
            setModalMode(null);
            setModalError(null);
          }
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
