"use client";

type AdminRunPayoutsModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  pendingMessage: string | null;
};

export function AdminRunPayoutsModal({
  onClose,
  onConfirm,
  pendingMessage,
}: AdminRunPayoutsModalProps) {
  return (
    <div
      className="admin-commissions-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-commissions-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-run-payouts-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-commissions-modal-head">
          <h2 id="admin-run-payouts-title" className="admin-commissions-modal-title">
            Run pending payouts?
          </h2>
        </div>
        <div className="admin-commissions-modal-body">
          <p>
            This will process eligible pilot payouts after the fixed 10% platform
            commission has been deducted.
          </p>
          {pendingMessage ? (
            <p
              className="admin-commissions-banner admin-commissions-banner--info"
              role="status"
              style={{ marginTop: "1rem" }}
            >
              {pendingMessage}
            </p>
          ) : null}
        </div>
        <div className="admin-commissions-modal-foot">
          <button
            type="button"
            className="admin-commissions-ledger-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-commissions-btn-run"
            onClick={onConfirm}
          >
            Confirm Run
          </button>
        </div>
      </div>
    </div>
  );
}
