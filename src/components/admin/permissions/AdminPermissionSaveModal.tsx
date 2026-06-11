type AdminPermissionSaveModalProps = {
  open: boolean;
  moderatorName: string;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminPermissionSaveModal({
  open,
  moderatorName,
  saving,
  onCancel,
  onConfirm,
}: AdminPermissionSaveModalProps) {
  if (!open) return null;

  return (
    <div className="admin-perms-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="admin-perms-modal"
        role="dialog"
        aria-labelledby="admin-perms-save-title"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-perms-save-title" className="admin-perms-modal-title">
          Update moderator access?
        </h2>
        <p className="admin-perms-modal-text">
          These permissions control what <strong>{moderatorName}</strong> can view and
          do across the platform.
        </p>
        <div className="admin-perms-modal-actions">
          <button
            type="button"
            className="admin-perms-modal-btn admin-perms-modal-btn--ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-perms-modal-btn admin-perms-modal-btn--gold"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Saving…" : "Confirm Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
