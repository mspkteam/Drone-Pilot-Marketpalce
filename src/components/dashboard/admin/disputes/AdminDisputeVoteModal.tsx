"use client";

type AdminDisputeVoteModalProps = {
  open: boolean;
  disputeLabel: string;
  onCancel: () => void;
};

export function AdminDisputeVoteModal({
  open,
  disputeLabel,
  onCancel,
}: AdminDisputeVoteModalProps) {
  if (!open) return null;

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
          Squadron voting for <strong>{disputeLabel}</strong> is not connected to
          a backend workflow yet. This action is a placeholder only and will not
          change case status.
        </p>
        <div className="admin-dispute-modal-actions">
          <button
            type="button"
            className="admin-dispute-modal-btn admin-dispute-modal-btn--outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-dispute-modal-btn admin-dispute-modal-btn--gold"
            onClick={onCancel}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
