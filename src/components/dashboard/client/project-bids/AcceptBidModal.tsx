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
        aria-labelledby="hire-pilot-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="hire-pilot-title" className="client-project-bids-modal-title">
          Hire this pilot?
        </h2>
        <p className="client-project-bids-modal-text">
          This will assign <strong>{bid.name}</strong> to your project and create
          a booking at {bid.bidAmount}. Other pending quotes will be declined
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
            Confirm Hire
          </button>
        </div>
      </div>
    </div>
  );
}
