"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ManagementUserRole } from "@/types/roles";

type AdminPersonnelInviteModalProps = {
  open: boolean;
  onClose: () => void;
};

const ROLE_OPTIONS: Array<{
  value: ManagementUserRole;
  title: string;
  description: string;
}> = [
  {
    value: "admin",
    title: "Admin",
    description: "Full ops access; can be limited later.",
  },
  {
    value: "moderator",
    title: "Moderator",
    description: "Permission-limited staff account.",
  },
];

export function AdminPersonnelInviteModal({
  open,
  onClose,
}: AdminPersonnelInviteModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ManagementUserRole>("moderator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  function resetForm() {
    setEmail("");
    setPassword("");
    setRole("moderator");
    setError(null);
    setSuccess(null);
    setLoading(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/management-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = (await res.json()) as {
        error?: string;
        user?: { email: string };
      };

      if (!res.ok) {
        setError(data.error ?? "Failed to create user.");
        return;
      }

      setSuccess(
        `${role === "admin" ? "Admin" : "Moderator"} account created for ${data.user?.email ?? email}.`,
      );
      router.refresh();
    } catch {
      setError("Failed to create user.");
    } finally {
      setLoading(false);
    }
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
          Add Admin / Moderator
        </h2>
        <p className="admin-personnel-modal-copy">
          Super Admin only. Create a staff account, then adjust module access on
          the Permissions page.
        </p>

        {error ? (
          <p className="admin-personnel-modal-error" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="admin-personnel-modal-success" role="status">
            {success}
          </p>
        ) : null}

        {success ? (
          <div className="admin-personnel-modal-actions">
            <button
              type="button"
              className="admin-personnel-btn-outline"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              type="button"
              className="admin-personnel-btn-export"
              onClick={() => {
                setSuccess(null);
                setEmail("");
                setPassword("");
              }}
            >
              Add another
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="admin-personnel-invite-form"
          >
            <label className="admin-personnel-field">
              <span className="admin-personnel-field-label">Email</span>
              <input
                type="email"
                className="admin-personnel-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ops@company.com"
                required
                disabled={loading}
              />
            </label>
            <label className="admin-personnel-field">
              <span className="admin-personnel-field-label">
                Temporary password
              </span>
              <input
                type="password"
                className="admin-personnel-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </label>

            <fieldset className="admin-personnel-role-fieldset" disabled={loading}>
              <legend className="admin-personnel-field-label">Role</legend>
              <div
                className="admin-personnel-role-grid"
                role="radiogroup"
                aria-label="Account role"
              >
                {ROLE_OPTIONS.map((option) => {
                  const selected = role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`admin-personnel-role-card${
                        selected ? " admin-personnel-role-card--active" : ""
                      }`}
                      onClick={() => setRole(option.value)}
                    >
                      <span className="admin-personnel-role-card-title">
                        {option.title}
                      </span>
                      <span className="admin-personnel-role-card-desc">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="admin-personnel-modal-actions">
              <button
                type="button"
                className="admin-personnel-btn-outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-personnel-btn-export"
                disabled={loading}
              >
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
