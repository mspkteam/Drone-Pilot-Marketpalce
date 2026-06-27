"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  clientDtoToFormState,
  clientFormToPayload,
  type ClientFormState,
} from "@/components/client/ClientProfileFormFields";
import {
  CLIENT_NOTIFICATION_DEFAULTS,
  CLIENT_NOTIFICATION_ROWS,
  notificationPreferencesFromProfile,
  type ClientNotificationPreferences,
} from "@/lib/client/settings-notifications";
import type { AccountDto } from "@/types/account";
import type { ClientProfileDto } from "@/types/client";
import { ClientSettingsToggle } from "./ClientSettingsToggle";

const ROLE_LABEL = "Client";

export function ClientAccountSettings() {
  const [account, setAccount] = useState<AccountDto | null>(null);
  const [profileForm, setProfileForm] = useState<ClientFormState | null>(null);
  const [notifications, setNotifications] = useState<ClientNotificationPreferences>(
    () => ({ ...CLIENT_NOTIFICATION_DEFAULTS }),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [accountRes, profileRes] = await Promise.all([
        fetch("/api/account"),
        fetch("/api/client/profile"),
      ]);
      const accountData = await accountRes.json();
      if (!accountRes.ok) {
        setError(accountData.error ?? "Failed to load account.");
        setAccount(null);
        setProfileForm(null);
        return;
      }

      setAccount(accountData.account);

      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.profile) {
        const profileDto = profileData.profile as ClientProfileDto;
        setProfileForm(clientDtoToFormState(profileDto));
        setNotifications(notificationPreferencesFromProfile(profileDto.preferences));
      } else {
        setProfileForm({
          companyName: "",
          contactName: "",
          phone: "",
          billingLine1: "",
          billingCity: "",
          billingRegion: "",
          billingCountry: "",
          billingPostalCode: "",
        });
      }
    } catch {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateForm(patch: Partial<ClientFormState>) {
    setProfileForm((current) => (current ? { ...current, ...patch } : current));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profileForm) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clientFormToPayload(profileForm, false),
          preferences: { notifications },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save settings.");
        return;
      }

      if (data.profile) {
        const profileDto = data.profile as ClientProfileDto;
        setProfileForm(clientDtoToFormState(profileDto));
        setNotifications(notificationPreferencesFromProfile(profileDto.preferences));
      }

      setSuccess("Settings saved.");
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Password update failed.");
      } else {
        setSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Password update failed.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function markAllNotificationsRead() {
    setError(null);
    try {
      const res = await fetch("/api/notifications", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not clear notifications.");
      } else {
        await load();
        setSuccess("All notifications marked as read.");
      }
    } catch {
      setError("Could not clear notifications.");
    }
  }

  if (loading) {
    return <p className="client-settings-status">Loading settings…</p>;
  }

  if (!account || !profileForm) {
    return (
      <p className="client-settings-status client-settings-status--error" role="alert">
        {error ?? "Account not available."}
      </p>
    );
  }

  return (
    <div className="client-settings-page">
      <header className="client-settings-header">
        <h1 className="client-settings-title">Account settings</h1>
        <p className="client-settings-subtitle">
          Manage your profile and how we contact you.
        </p>
      </header>

      {error ? (
        <p className="client-settings-banner client-settings-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="client-settings-banner" role="status">
          {success}
        </p>
      ) : null}

      <form className="client-settings-form" onSubmit={(e) => void handleSave(e)}>
        <section className="client-settings-card">
          <h2 className="client-settings-card-title">Profile information</h2>

          <div className="client-settings-field-grid">
            <label className="client-settings-field">
              <span className="client-settings-label">Full name</span>
              <input
                className="client-settings-input"
                value={profileForm.contactName}
                onChange={(e) => updateForm({ contactName: e.target.value })}
                required
                minLength={2}
              />
            </label>

            <label className="client-settings-field">
              <span className="client-settings-label">Email</span>
              <input
                className="client-settings-input client-settings-input--readonly"
                value={account.email}
                readOnly
                aria-readonly="true"
              />
            </label>
          </div>

          <label className="client-settings-field client-settings-field--full">
            <span className="client-settings-label">Phone</span>
            <input
              className="client-settings-input"
              type="tel"
              value={profileForm.phone}
              onChange={(e) => updateForm({ phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </label>
        </section>

        <section className="client-settings-card">
          <h2 className="client-settings-card-title">Company &amp; billing</h2>
          <p className="client-settings-card-hint">
            Optional company and billing address used for invoices.
          </p>

          <label className="client-settings-field client-settings-field--full">
            <span className="client-settings-label">Company name</span>
            <input
              className="client-settings-input"
              value={profileForm.companyName}
              onChange={(e) => updateForm({ companyName: e.target.value })}
            />
          </label>

          <div className="client-settings-field-grid">
            <label className="client-settings-field client-settings-field--full">
              <span className="client-settings-label">Billing address</span>
              <input
                className="client-settings-input"
                value={profileForm.billingLine1}
                onChange={(e) => updateForm({ billingLine1: e.target.value })}
              />
            </label>
            <label className="client-settings-field">
              <span className="client-settings-label">City</span>
              <input
                className="client-settings-input"
                value={profileForm.billingCity}
                onChange={(e) => updateForm({ billingCity: e.target.value })}
              />
            </label>
            <label className="client-settings-field">
              <span className="client-settings-label">State / region</span>
              <input
                className="client-settings-input"
                value={profileForm.billingRegion}
                onChange={(e) => updateForm({ billingRegion: e.target.value })}
              />
            </label>
            <label className="client-settings-field">
              <span className="client-settings-label">Country</span>
              <input
                className="client-settings-input"
                value={profileForm.billingCountry}
                onChange={(e) => updateForm({ billingCountry: e.target.value })}
              />
            </label>
            <label className="client-settings-field">
              <span className="client-settings-label">Postal code</span>
              <input
                className="client-settings-input"
                value={profileForm.billingPostalCode}
                onChange={(e) =>
                  updateForm({ billingPostalCode: e.target.value })
                }
              />
            </label>
          </div>

          <p className="client-settings-inline-link">
            Full marketplace profile editor on the{" "}
            <Link href="/dashboard/client/profile">Profile</Link> page.
          </p>
        </section>

        <section className="client-settings-card">
          <h2 className="client-settings-card-title">Notifications</h2>

          <ul className="client-settings-notifications">
            {CLIENT_NOTIFICATION_ROWS.map((row) => (
              <li key={row.key} className="client-settings-notification-row">
                <div>
                  <p className="client-settings-notification-title">{row.title}</p>
                  <p className="client-settings-notification-desc">
                    {row.description}
                  </p>
                </div>
                <ClientSettingsToggle
                  id={`notify-${row.key}`}
                  checked={notifications[row.key]}
                  onChange={(checked) =>
                    setNotifications((current) => ({
                      ...current,
                      [row.key]: checked,
                    }))
                  }
                />
              </li>
            ))}
          </ul>

          <div className="client-settings-inbox-meta">
            <p>
              In-app notifications are enabled. Email delivery uses SMTP in a later
              phase; alerts also appear in your dashboard bell.
            </p>
            <p>
              <strong>{account.unreadNotifications}</strong> unread notification
              {account.unreadNotifications === 1 ? "" : "s"}
            </p>
            {account.unreadNotifications > 0 ? (
              <button
                type="button"
                className="client-settings-secondary-btn"
                onClick={() => void markAllNotificationsRead()}
              >
                Mark all as read
              </button>
            ) : null}
          </div>
        </section>

        <section className="client-settings-card">
          <h2 className="client-settings-card-title">Disputes</h2>
          <p className="client-settings-card-hint">
            View and manage booking disputes. Opening a new dispute requires an
            active booking.
          </p>
          <Link href="/dashboard/client/disputes" className="client-settings-text-link">
            Go to disputes →
          </Link>
        </section>

        <div className="client-settings-save-row">
          <button
            type="submit"
            className="client-settings-save-btn"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <section className="client-settings-card">
        <h2 className="client-settings-card-title">Account</h2>
        <dl className="client-settings-account-grid">
          <div>
            <dt>Role</dt>
            <dd>{ROLE_LABEL}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className="capitalize">{account.status}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{new Date(account.createdAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{account.email}</dd>
          </div>
        </dl>
      </section>

      <section className="client-settings-card">
        <h2 className="client-settings-card-title">Change password</h2>
        <form
          className="client-settings-password-form"
          onSubmit={(e) => void handlePasswordChange(e)}
        >
          <label className="client-settings-field client-settings-field--full">
            <span className="client-settings-label">Current password</span>
            <input
              className="client-settings-input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <div className="client-settings-field-grid">
            <label className="client-settings-field">
              <span className="client-settings-label">New password</span>
              <input
                className="client-settings-input"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
            <label className="client-settings-field">
              <span className="client-settings-label">Confirm new password</span>
              <input
                className="client-settings-input"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="client-settings-secondary-btn"
            disabled={changingPassword}
          >
            {changingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
