"use client";

import type { ClientProjectBid } from "@/lib/client/project-bids-mock";

type AcceptBidModalProps = {
  bid: ClientProjectBid | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AcceptBidModal({ bid, onCancel, onConfirm }: AcceptBidModalProps) {
  if (!bid) return null;

  return (
    <div
      className="client-project-bids-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="client-project-bids-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="accept-bid-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="accept-bid-title" className="client-project-bids-modal-title">
          Accept this bid?
        </h2>
        <p className="client-project-bids-modal-text">
          This will mark the bid from <strong>{bid.name}</strong> as accepted.
          Payment and booking setup will be connected later.
        </p>
        <div className="client-project-bids-modal-actions">
          <button
            type="button"
            className="client-project-bids-btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="client-project-bids-btn-gold"
            onClick={onConfirm}
          >
            Confirm Accept
          </button>
        </div>
      </div>
    </div>
  );
}
