type PilotDeactivateModalProps = {
  open: boolean;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PilotDeactivateModal({
  open,
  submitting,
  onCancel,
  onConfirm,
}: PilotDeactivateModalProps) {
  if (!open) return null;

  return (
    <div className="pilot-settings-modal-backdrop" role="presentation">
      <div
        className="pilot-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pilot-deactivate-title"
      >
        <h2 id="pilot-deactivate-title" className="pilot-settings-modal-title">
          Deactivate your account?
        </h2>
        <p className="pilot-settings-modal-text">
          This will deactivate your pilot account for 30 days. You can reactivate it by
          logging in again before the 30-day period ends. After 30 days, the account will
          be scheduled for permanent deletion.
        </p>
        <div className="pilot-settings-modal-actions">
          <button
            type="button"
            className="pilot-settings-btn-outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pilot-settings-btn-danger"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? "Processing…" : "Confirm Deactivation"}
          </button>
        </div>
      </div>
    </div>
  );
}
