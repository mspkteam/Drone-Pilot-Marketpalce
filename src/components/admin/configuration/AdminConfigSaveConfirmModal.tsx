"use client";

type AdminConfigSaveConfirmModalProps = {
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminConfigSaveConfirmModal({
  saving,
  onCancel,
  onConfirm,
}: AdminConfigSaveConfirmModalProps) {
  return (
    <div
      className="admin-config-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="admin-config-modal admin-config-modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-config-save-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-config-modal-head">
          <h2 id="admin-config-save-title" className="admin-config-modal-title">
            Apply platform-wide changes?
          </h2>
          <p className="admin-config-modal-sub">
            These settings affect every user immediately. Confirm only after reviewing
            the changes.
          </p>
        </div>
        <div className="admin-config-modal-foot">
          <button
            type="button"
            className="admin-config-btn-outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-config-btn-gold"
            onClick={onConfirm}
            disabled={saving}
          >
            Confirm Save
          </button>
        </div>
      </div>
    </div>
  );
}
