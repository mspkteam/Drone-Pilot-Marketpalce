"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminDisputeVoteModalProps = {
  open: boolean;
  disputeId: string;
  disputeLabel: string;
  startReview: boolean;
  onCancel: () => void;
};

export function AdminDisputeVoteModal({
  open,
  disputeId,
  disputeLabel,
  startReview,
  onCancel,
}: AdminDisputeVoteModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function sendToSquadron() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/squadron-voting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open", disputeId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not open squadron vote.");
        return;
      }

      if (startReview) {
        await fetch(`/api/admin/disputes/${disputeId}/review`, { method: "POST" });
      }

      onCancel();
      router.push("/dashboard/admin/squadron-voting");
      router.refresh();
    } catch {
      setError("Could not open squadron vote.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-dispute-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-dispute-modal"
        role="dialog"
        aria-labelledby="vote-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="vote-modal-title" className="admin-dispute-modal-title">
          Send to squadron vote?
        </h2>
        <p className="admin-dispute-modal-text">
          Open a 48-hour peer moderation poll for <strong>{disputeLabel}</strong>.
          A-4+ officers can side with the client or the pilot. You can override
          or close early from Squadron Voting.
        </p>
        {error ? (
          <p className="admin-dispute-modal-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="admin-dispute-modal-actions">
          <button
            type="button"
            className="admin-dispute-modal-btn admin-dispute-modal-btn--outline"
            disabled={submitting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-dispute-modal-btn admin-dispute-modal-btn--gold"
            disabled={submitting}
            onClick={() => void sendToSquadron()}
          >
            {submitting ? "Opening…" : "Open squadron vote"}
          </button>
        </div>
      </div>
    </div>
  );
}
