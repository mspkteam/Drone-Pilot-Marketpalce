"use client";

import { useState } from "react";

type AdminPersonnelInviteModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminPersonnelInviteModal({
  open,
  onClose,
}: AdminPersonnelInviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Pilot");
  const [region, setRegion] = useState("Global");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handleClose() {
    setSubmitted(false);
    setEmail("");
    onClose();
  }

  return (
    <div
      className="admin-personnel-modal-backdrop"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="admin-personnel-modal"
        role="dialog"
        aria-labelledby="personnel-invite-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="personnel-invite-title" className="admin-personnel-modal-title">
          Invite user
        </h2>
        {submitted ? (
          <>
            <p className="admin-personnel-modal-copy">
              Invite request recorded locally. Email delivery and account
              provisioning workflow is pending backend integration.
            </p>
            <div className="admin-personnel-modal-actions">
              <button
                type="button"
                className="admin-personnel-btn-outline"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="admin-personnel-invite-form">
            <label className="admin-personnel-field">
              <span className="admin-personnel-field-label">Email</span>
              <input
                type="email"
                className="admin-personnel-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="admin-personnel-field">
              <span className="admin-personnel-field-label">Role</span>
              <select
                className="admin-personnel-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Pilot</option>
                <option>Client</option>
                <option>Moderator</option>
              </select>
            </label>
            <label className="admin-personnel-field">
              <span className="admin-personnel-field-label">Region</span>
              <select
                className="admin-personnel-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option>Global</option>
                <option>North America</option>
                <option>Western Europe</option>
                <option>Asia Pacific</option>
              </select>
            </label>
            <div className="admin-personnel-modal-actions">
              <button
                type="button"
                className="admin-personnel-btn-outline"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="admin-personnel-btn-export">
                Send invite
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
