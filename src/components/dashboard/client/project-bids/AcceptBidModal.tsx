"use client";

import type { ClientProjectBid } from "@/lib/client/project-bids";

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
          This will assign <strong>{bid.name}</strong> to your project and create
          a booking at {bid.bidAmount}. Other pending bids will be declined
          automatically.
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
