"use client";

import { useEffect, useId, useState } from "react";
import {
  JOB_APPROVAL_VISIBILITY_STEPS,
  JOB_REJECT_REASON_PRESETS,
  JOB_REJECTION_NEXT_STEPS,
} from "@/lib/admin/job-approval-next-steps";

type AdminJobApprovalModalProps = {
  open: boolean;
  mode: "approve" | "reject";
  missionTitle: string;
  missionId?: string;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
};

export function AdminJobApprovalModal({
  open,
  mode,
  missionTitle,
  missionId,
  submitting,
  error,
  onCancel,
  onConfirm,
}: AdminJobApprovalModalProps) {
  const titleId = useId();
  const [reason, setReason] = useState("");
  const [preset, setPreset] = useState<string>("");

  useEffect(() => {
    if (open) {
      setReason("");
      setPreset("");
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, submitting, onCancel]);

  if (!open) return null;

  const isApprove = mode === "approve";
  const nextSteps = isApprove
    ? JOB_APPROVAL_VISIBILITY_STEPS
    : JOB_REJECTION_NEXT_STEPS;

  function applyPreset(value: string) {
    setPreset(value);
    if (value && value !== "__custom") {
      setReason(value);
    }
  }

  return (
    <div
      className="admin-job-approval-modal-backdrop"
      role="presentation"
      onClick={() => {
        if (!submitting) onCancel();
      }}
    >
      <div
        className="admin-job-approval-modal"
        data-mode={mode}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-job-approval-modal-accent" aria-hidden />

        <header className="admin-job-approval-modal-head">
          <div className="admin-job-approval-modal-head-copy">
            <p className="admin-job-approval-modal-kicker">
              {isApprove ? "Approve mission" : "Reject mission"}
            </p>
            <h2 id={titleId} className="admin-job-approval-modal-title">
              {isApprove ? "Release to the pilot network?" : "Reject this mission?"}
            </h2>
          </div>
          <button
            type="button"
            className="admin-job-approval-modal-close"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="admin-job-approval-modal-body">
          <p className="admin-job-approval-modal-mission">
            {missionId ? <span className="admin-job-approval-modal-mission-id">{missionId}</span> : null}
            {missionId ? <span aria-hidden> · </span> : null}
            <span>{missionTitle}</span>
          </p>

          <p className="admin-job-approval-modal-copy">
            {isApprove
              ? "Confirm only after you have reviewed scope, location, budget, and risk flags."
              : "The client will see your reason. Choose a preset or write a clear policy note."}
          </p>

          <div className="admin-job-approval-next-steps">
            <p className="admin-job-approval-next-steps-title">What happens next</p>
            <ol className="admin-job-approval-next-steps-list">
              {nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          {!isApprove ? (
            <div className="admin-job-approval-modal-field">
              <label className="admin-job-approval-modal-label" htmlFor="job-reject-preset">
                Reason preset
              </label>
              <div className="admin-job-approval-modal-select-wrap">
                <select
                  id="job-reject-preset"
                  className="admin-job-approval-modal-select"
                  value={preset}
                  onChange={(e) => applyPreset(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Select a reason…</option>
                  {JOB_REJECT_REASON_PRESETS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value="__custom">Custom reason</option>
                </select>
              </div>

              <label className="admin-job-approval-modal-label" htmlFor="job-reject-reason">
                Rejection reason (client-visible)
              </label>
              <textarea
                id="job-reject-reason"
                className="admin-job-approval-modal-textarea"
                rows={3}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (preset && preset !== "__custom" && e.target.value !== preset) {
                    setPreset("__custom");
                  }
                }}
                placeholder="Min. 5 characters — be specific enough for the client to fix and resubmit"
                required
                disabled={submitting}
              />
            </div>
          ) : null}

          {error ? (
            <p className="admin-job-approval-modal-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="admin-job-approval-modal-actions">
          <button
            type="button"
            className="admin-job-approval-btn admin-job-approval-btn--ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`admin-job-approval-btn ${
              isApprove
                ? "admin-job-approval-btn--approve"
                : "admin-job-approval-btn--reject"
            }`}
            onClick={() => onConfirm(isApprove ? undefined : reason)}
            disabled={submitting || (!isApprove && reason.trim().length < 5)}
          >
            {submitting
              ? "Processing…"
              : isApprove
                ? "Confirm approval"
                : "Confirm rejection"}
          </button>
        </footer>
      </div>
    </div>
  );
}
