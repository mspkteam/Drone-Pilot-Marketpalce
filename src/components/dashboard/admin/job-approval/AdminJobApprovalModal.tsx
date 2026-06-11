"use client";

import { useState } from "react";

type AdminJobApprovalModalProps = {
  open: boolean;
  mode: "approve" | "reject";
  missionTitle: string;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
};

export function AdminJobApprovalModal({
  open,
  mode,
  missionTitle,
  submitting,
  error,
  onCancel,
  onConfirm,
}: AdminJobApprovalModalProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const isApprove = mode === "approve";

  return (
    <div
      className="admin-job-approval-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="admin-job-approval-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-approval-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="job-approval-modal-title" className="admin-job-approval-modal-title">
          {isApprove ? "Approve mission?" : "Reject mission?"}
        </h2>
        <p className="admin-job-approval-modal-copy">
          {isApprove
            ? `This mission will be released to the pilot network.`
            : `This mission will not be released. Add or select a policy reason if the existing system supports it.`}
        </p>
        <p className="admin-job-approval-modal-mission">{missionTitle}</p>

        {!isApprove ? (
          <label className="admin-job-approval-modal-field">
            <span className="admin-job-approval-modal-label">Rejection reason</span>
            <textarea
              className="admin-job-approval-modal-textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Policy violation details (min 5 characters)"
              required
            />
          </label>
        ) : null}

        {error ? (
          <p className="admin-job-approval-modal-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="admin-job-approval-modal-actions">
          <button
            type="button"
            className="admin-job-approval-btn-review"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-job-approval-btn-approve"
            onClick={() => onConfirm(isApprove ? undefined : reason)}
            disabled={submitting || (!isApprove && reason.trim().length < 5)}
          >
            {submitting
              ? "Processing…"
              : isApprove
                ? "Confirm Approval"
                : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}
