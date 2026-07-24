"use client";

import { useEffect, useId, useState } from "react";
import { DashboardModalPortal } from "@/components/ui/DashboardModalPortal";
import type { AdminUserEditDto } from "@/types/admin-user-edit";
import { USER_ACCOUNT_STATUSES } from "@/types/admin-user-edit";

type AdminPersonnelEditModalProps = {
  userId: string | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function AdminPersonnelEditModal({
  userId,
  open,
  onClose,
  onSaved,
}: AdminPersonnelEditModalProps) {
  const titleId = useId();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUserEditDto | null>(null);

  const [email, setEmail] = useState("");
  const [accountStatus, setAccountStatus] = useState("active");
  const [moderationNote, setModerationNote] = useState("");
  const [pilotDisplayName, setPilotDisplayName] = useState("");
  const [pilotStatus, setPilotStatus] = useState("approved");
  const [pilotPublic, setPilotPublic] = useState(false);
  const [clientContactName, setClientContactName] = useState("");
  const [clientCompanyName, setClientCompanyName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientStatus, setClientStatus] = useState("active");

  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const json = (await res.json()) as {
          user?: AdminUserEditDto;
          error?: string;
        };
        if (!res.ok || !json.user) {
          if (!cancelled) setError(json.error ?? "Failed to load user.");
          return;
        }
        if (cancelled) return;
        const u = json.user;
        setUser(u);
        setEmail(u.email);
        setAccountStatus(u.status);
        setModerationNote(u.moderationNote ?? "");
        if (u.pilot) {
          setPilotDisplayName(u.pilot.displayName);
          setPilotStatus(u.pilot.status);
          setPilotPublic(u.pilot.isPublic);
        }
        if (u.client) {
          setClientContactName(u.client.contactName);
          setClientCompanyName(u.client.companyName ?? "");
          setClientPhone(u.client.phone ?? "");
          setClientStatus(u.client.status);
        }
      } catch {
        if (!cancelled) setError("Failed to load user.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, saving]);

  if (!open || !userId) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        email,
        status: accountStatus,
        moderationNote: moderationNote.trim() || null,
      };
      if (user?.pilot) {
        body.pilot = {
          displayName: pilotDisplayName,
          status: pilotStatus,
          isPublic: pilotPublic,
        };
      }
      if (user?.client) {
        body.client = {
          contactName: clientContactName,
          companyName: clientCompanyName.trim() || null,
          phone: clientPhone.trim() || null,
          status: clientStatus,
        };
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Save failed.");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardModalPortal>
      <div
        className="admin-personnel-edit-backdrop"
        role="presentation"
        onClick={() => {
          if (!saving) onClose();
        }}
      >
        <div
          className="admin-personnel-edit-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="admin-personnel-edit-head">
            <div>
              <p className="admin-ops-eyebrow">USER ACCOUNT</p>
              <h2 id={titleId} className="admin-personnel-edit-title">
                Edit user
              </h2>
            </div>
            <button
              type="button"
              className="admin-personnel-edit-close"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          {loading ? (
            <p className="admin-personnel-edit-hint">Loading…</p>
          ) : error && !user ? (
            <p className="admin-personnel-edit-error" role="alert">
              {error}
            </p>
          ) : user ? (
            <form className="admin-personnel-edit-form" onSubmit={handleSubmit}>
              {error ? (
                <p className="admin-personnel-edit-error" role="alert">
                  {error}
                </p>
              ) : null}

              <section className="admin-personnel-edit-section">
                <p className="admin-personnel-edit-section-title">Account</p>
                <label className="admin-personnel-edit-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={saving}
                  />
                </label>
                <label className="admin-personnel-edit-field">
                  <span>Login status</span>
                  <select
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value)}
                    disabled={saving}
                  >
                    {USER_ACCOUNT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="admin-personnel-edit-hint">
                  <code>pending</code> / <code>suspended</code> block login.
                  Use profile status below for soft review holds.
                </p>
                <label className="admin-personnel-edit-field">
                  <span>Moderation note (internal)</span>
                  <textarea
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    rows={2}
                    placeholder="ToS violation details…"
                    disabled={saving}
                  />
                </label>
              </section>

              {user.pilot ? (
                <section className="admin-personnel-edit-section">
                  <p className="admin-personnel-edit-section-title">
                    Pilot profile
                  </p>
                  <label className="admin-personnel-edit-field">
                    <span>Display name</span>
                    <input
                      value={pilotDisplayName}
                      onChange={(e) => setPilotDisplayName(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </label>
                  <label className="admin-personnel-edit-field">
                    <span>Profile status</span>
                    <select
                      value={pilotStatus}
                      onChange={(e) => setPilotStatus(e.target.value)}
                      disabled={saving}
                    >
                      <option value="draft">draft</option>
                      <option value="pending_review">pending_review</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                      <option value="suspended">suspended</option>
                    </select>
                  </label>
                  <label className="admin-personnel-edit-check">
                    <input
                      type="checkbox"
                      checked={pilotPublic}
                      onChange={(e) => setPilotPublic(e.target.checked)}
                      disabled={
                        saving ||
                        pilotStatus === "pending_review" ||
                        pilotStatus === "suspended" ||
                        pilotStatus === "rejected"
                      }
                    />
                    Public directory listing
                  </label>
                  <p className="admin-personnel-edit-hint">
                    Set <code>pending_review</code> for ToS investigation without
                    deleting the account.
                  </p>
                </section>
              ) : null}

              {user.client ? (
                <section className="admin-personnel-edit-section">
                  <p className="admin-personnel-edit-section-title">
                    Client profile
                  </p>
                  <label className="admin-personnel-edit-field">
                    <span>Contact name</span>
                    <input
                      value={clientContactName}
                      onChange={(e) => setClientContactName(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </label>
                  <label className="admin-personnel-edit-field">
                    <span>Company</span>
                    <input
                      value={clientCompanyName}
                      onChange={(e) => setClientCompanyName(e.target.value)}
                      disabled={saving}
                    />
                  </label>
                  <label className="admin-personnel-edit-field">
                    <span>Phone</span>
                    <input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      disabled={saving}
                    />
                  </label>
                  <label className="admin-personnel-edit-field">
                    <span>Profile status</span>
                    <select
                      value={clientStatus}
                      onChange={(e) => setClientStatus(e.target.value)}
                      disabled={saving}
                    >
                      <option value="draft">draft</option>
                      <option value="active">active</option>
                      <option value="pending_review">pending_review</option>
                      <option value="suspended">suspended</option>
                    </select>
                  </label>
                </section>
              ) : null}

              <footer className="admin-personnel-edit-foot">
                <button
                  type="button"
                  className="admin-personnel-action"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-personnel-edit-save"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </footer>
            </form>
          ) : null}
        </div>
      </div>
    </DashboardModalPortal>
  );
}
