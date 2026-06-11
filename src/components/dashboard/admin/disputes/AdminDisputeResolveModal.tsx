"use client";

import { useState } from "react";
import { getDisputeResolutionLabel } from "@/lib/disputes/status";
import type { DisputeResolutionType } from "@/types/dispute";
import { DISPUTE_RESOLUTION_TYPES } from "@/types/dispute";

type AdminDisputeResolveModalProps = {
  open: boolean;
  disputeId: string;
  disputeLabel: string;
  canResolve: boolean;
  needsReview: boolean;
  onCancel: () => void;
  onResolved: () => void;
};

export function AdminDisputeResolveModal({
  open,
  disputeId,
  disputeLabel,
  canResolve,
  needsReview,
  onCancel,
  onResolved,
}: AdminDisputeResolveModalProps) {
  const [resolutionType, setResolutionType] =
    useState<DisputeResolutionType>("full_payout");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionAmount, setResolutionAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleResolve() {
    if (!canResolve) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolutionType,
          resolutionNotes,
          resolutionAmount:
            resolutionType === "partial_payout"
              ? parseFloat(resolutionAmount)
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Resolution failed.");
        return;
      }
      onResolved();
    } catch {
      setError("Resolution failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-dispute-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-dispute-modal admin-dispute-modal--wide"
        role="dialog"
        aria-labelledby="resolve-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="resolve-modal-title" className="admin-dispute-modal-title">
          Resolve dispute
        </h2>
        <p className="admin-dispute-modal-text">
          Case: <strong>{disputeLabel}</strong>
        </p>

        {needsReview ? (
          <p className="admin-dispute-modal-info">
            This case must be in review before resolution. Open the thread and
            use <strong>Start review</strong> first.
          </p>
        ) : !canResolve ? (
          <p className="admin-dispute-modal-info">
            Only a Super Admin can resolve disputes after review.
          </p>
        ) : (
          <>
            <label className="admin-dispute-field">
              <span className="admin-dispute-field-label">Resolution outcome</span>
              <select
                className="admin-dispute-select"
                value={resolutionType}
                onChange={(event) =>
                  setResolutionType(event.target.value as DisputeResolutionType)
                }
              >
                {DISPUTE_RESOLUTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getDisputeResolutionLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            {resolutionType === "partial_payout" ? (
              <label className="admin-dispute-field">
                <span className="admin-dispute-field-label">
                  Pilot payout amount
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="admin-dispute-input"
                  value={resolutionAmount}
                  onChange={(event) => setResolutionAmount(event.target.value)}
                />
              </label>
            ) : null}

            <label className="admin-dispute-field">
              <span className="admin-dispute-field-label">Resolution note</span>
              <textarea
                className="admin-dispute-textarea"
                rows={4}
                value={resolutionNotes}
                onChange={(event) => setResolutionNotes(event.target.value)}
                placeholder="Document the resolution decision..."
              />
            </label>

            {error ? (
              <p className="admin-dispute-modal-error" role="alert">
                {error}
              </p>
            ) : null}
          </>
        )}

        <div className="admin-dispute-modal-actions">
          <button
            type="button"
            className="admin-dispute-modal-btn admin-dispute-modal-btn--outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          {canResolve && !needsReview ? (
            <button
              type="button"
              className="admin-dispute-modal-btn admin-dispute-modal-btn--gold"
              disabled={submitting || resolutionNotes.trim().length < 5}
              onClick={() => void handleResolve()}
            >
              {submitting ? "Resolving…" : "Confirm resolution"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
