"use client";

import { useMemo, useState } from "react";
import type { AdminBadgeCardDto } from "@/types/admin-badges";

type PilotOption = { id: string; displayName: string; email: string };

type AdminBadgeAssignModalProps = {
  badge: AdminBadgeCardDto;
  pilots: PilotOption[];
  initialPilotId?: string;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onAssign: (input: {
    pilotProfileId: string;
    note: string;
  }) => void;
};

export function AdminBadgeAssignModal({
  badge,
  pilots,
  initialPilotId,
  saving,
  error,
  onClose,
  onAssign,
}: AdminBadgeAssignModalProps) {
  const [search, setSearch] = useState("");
  const [pilotId, setPilotId] = useState(initialPilotId ?? "");
  const [note, setNote] = useState("");

  const filteredPilots = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return pilots;
    return pilots.filter(
      (pilot) =>
        pilot.displayName.toLowerCase().includes(query) ||
        pilot.email.toLowerCase().includes(query),
    );
  }, [pilots, search]);

  const preselected = pilots.find((pilot) => pilot.id === pilotId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!pilotId) return;
    onAssign({ pilotProfileId: pilotId, note: note.trim() });
  }

  return (
    <div
      className="admin-badges-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-badges-modal admin-badges-modal--assign"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-badge-assign-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-badges-modal-head">
          <h2 id="admin-badge-assign-title" className="admin-badges-modal-title">
            Assign Badge
          </h2>
          <p className="admin-badges-modal-subtitle">
            Award <strong>{badge.title}</strong>
            {preselected ? (
              <>
                {" "}
                to <strong>{preselected.displayName}</strong>.
              </>
            ) : (
              " to a pilot manually."
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-badges-modal-body">
            {error ? (
              <p className="admin-badges-banner admin-badges-banner--error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="admin-badges-field">
              <label htmlFor="assign-search">Search pilot</label>
              <input
                id="assign-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, email, or call sign"
              />
            </div>

            <div className="admin-badges-field">
              <label htmlFor="assign-pilot">Select pilot</label>
              <select
                id="assign-pilot"
                value={pilotId}
                onChange={(event) => setPilotId(event.target.value)}
                required
              >
                <option value="">Select pilot…</option>
                {filteredPilots.map((pilot) => (
                  <option key={pilot.id} value={pilot.id}>
                    {pilot.displayName} ({pilot.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-badges-field">
              <label htmlFor="assign-note">Assignment note / reason</label>
              <textarea
                id="assign-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Optional — reason or context for this award"
              />
            </div>

            <p className="admin-badges-hint">
              Assignment notes are saved with the award and visible to admins.
            </p>
          </div>

          <div className="admin-badges-modal-foot">
            <button
              type="button"
              className="admin-badges-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="admin-badges-btn-save" disabled={saving}>
              {saving ? "Assigning…" : "Assign Badge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
