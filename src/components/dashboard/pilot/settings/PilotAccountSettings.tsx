"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PilotDeactivateModal } from "./PilotDeactivateModal";
import { PilotSettingsCheckbox } from "./PilotSettingsCheckbox";
import type { AccountDto } from "@/types/account";
import type { PilotProfileDto } from "@/types/pilot";

const ROLE_LABELS: Record<string, string> = {
  client: "Client",
  pilot: "Pilot",
  moderator: "Moderator",
  admin: "Admin",
  super_admin: "Super Admin",
};

const NAV_ITEMS = [
  { id: "personal", label: "Personal Info", icon: "user" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "payment", label: "Payment Info", icon: "card" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "danger", label: "Danger Zone", icon: "alert" },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

function NavIcon({ type }: { type: string }) {
  if (type === "bell") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 2.5a3.5 3.5 0 00-3.5 3.5v2.1L3.5 10v1h9v-1l-1-2.1V6A3.5 3.5 0 008 2.5zM6.5 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "card") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2" y="4" width="12" height="8" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
        <path d="M2 7h12" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    );
  }
  if (type === "shield") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 2.5L12.5 4.5V8c0 2.4-1.8 4.6-4.5 5.5C5.3 12.6 3.5 10.4 3.5 8V4.5L8 2.5z" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    );
  }
  if (type === "alert") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 3.5l5 8.5H3L8 3.5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M8 7v2.5M8 11h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M4 13.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function formatLocation(profile: PilotProfileDto): string {
  const parts = [profile.locationCity, profile.locationRegion, profile.locationCountry]
    .filter(Boolean)
    .join(", ");
  return parts || "—";
}

export function PilotAccountSettings() {
  const [account, setAccount] = useState<AccountDto | null>(null);
  const [pilotProfile, setPilotProfile] = useState<PilotProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<NavId>("personal");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingPublic, setSavingPublic] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [accountRes, profileRes] = await Promise.all([
        fetch("/api/account"),
        fetch("/api/pilot/profile"),
      ]);
      const accountData = await accountRes.json();
      if (!accountRes.ok) {
        setError(accountData.error ?? "Failed to load account.");
        setAccount(null);
      } else {
        setAccount(accountData.account);
      }

      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.profile) {
        setPilotProfile(profileData.profile);
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

  function scrollToSection(id: NavId) {
    setActiveNav(id);
    document.getElementById(`pilot-settings-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  async function togglePublicProfile(next: boolean) {
    if (!pilotProfile) return;
    setSavingPublic(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/pilot/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update profile visibility.");
      } else {
        setPilotProfile(data.profile);
        setSuccess(
          next
            ? "Your profile is visible on the public pilot directory."
            : "Your profile is hidden from the public directory.",
        );
      }
    } catch {
      setError("Could not update profile visibility.");
    } finally {
      setSavingPublic(false);
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

  function handleDeactivateConfirm() {
    setDeactivating(true);
    setError(null);
    setSuccess(null);
    window.setTimeout(() => {
      setDeactivating(false);
      setDeactivateOpen(false);
      setSuccess(
        "Account deactivation request recorded. Backend workflow pending implementation.",
      );
    }, 600);
  }

  if (loading) {
    return <p className="pilot-settings-loading">Loading settings…</p>;
  }

  if (!account) {
    return (
      <p className="pilot-settings-banner pilot-settings-banner--error" role="alert">
        {error ?? "Account not available."}
      </p>
    );
  }

  return (
    <div className="pilot-settings-page">
      <header className="pilot-settings-header pilot-settings-bracket-card">
        <p className="pilot-settings-eyebrow">ACCOUNT / SETTINGS</p>
        <h1 className="pilot-settings-title">Flight Officer Settings</h1>
      </header>

      {error ? (
        <p className="pilot-settings-banner pilot-settings-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="pilot-settings-banner" role="status">
          {success}
        </p>
      ) : null}

      <div className="pilot-settings-layout">
        <nav className="pilot-settings-nav" aria-label="Settings sections">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pilot-settings-nav-item${
                activeNav === item.id ? " pilot-settings-nav-item--active" : ""
              }`}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="pilot-settings-nav-icon">
                <NavIcon type={item.icon} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pilot-settings-content">
          <section id="pilot-settings-personal" className="pilot-settings-card">
            <h2 className="pilot-settings-card-title">PERSONAL INFORMATION</h2>
            <div className="pilot-settings-field-grid">
              <label className="pilot-settings-field">
                <span className="pilot-settings-label">Full Name</span>
                <input
                  className="pilot-settings-input pilot-settings-input--readonly"
                  value={pilotProfile?.displayName ?? "—"}
                  readOnly
                  aria-readonly="true"
                />
              </label>
              <label className="pilot-settings-field">
                <span className="pilot-settings-label">Email</span>
                <input
                  className="pilot-settings-input pilot-settings-input--readonly"
                  value={account.email}
                  readOnly
                  aria-readonly="true"
                />
              </label>
              <label className="pilot-settings-field">
                <span className="pilot-settings-label">Role</span>
                <input
                  className="pilot-settings-input pilot-settings-input--readonly"
                  value={ROLE_LABELS[account.role] ?? account.role}
                  readOnly
                  aria-readonly="true"
                />
              </label>
              <label className="pilot-settings-field">
                <span className="pilot-settings-label">Account Status</span>
                <input
                  className="pilot-settings-input pilot-settings-input--readonly"
                  value={account.status}
                  readOnly
                  aria-readonly="true"
                />
              </label>
              <label className="pilot-settings-field">
                <span className="pilot-settings-label">Member Since</span>
                <input
                  className="pilot-settings-input pilot-settings-input--readonly"
                  value={new Date(account.createdAt).toLocaleDateString()}
                  readOnly
                  aria-readonly="true"
                />
              </label>
              <label className="pilot-settings-field">
                <span className="pilot-settings-label">Location</span>
                <input
                  className="pilot-settings-input pilot-settings-input--readonly"
                  value={pilotProfile ? formatLocation(pilotProfile) : "—"}
                  readOnly
                  aria-readonly="true"
                />
              </label>
            </div>

            {pilotProfile ? (
              <div className="pilot-settings-subsection">
                <PilotSettingsCheckbox
                  id="pilot-public-profile"
                  checked={pilotProfile.isPublic}
                  disabled={savingPublic || pilotProfile.status !== "approved"}
                  label={
                    pilotProfile.status !== "approved"
                      ? "Show my profile publicly (available after admin approval)"
                      : "Show my profile publicly on /pilots"
                  }
                  onChange={(checked) => void togglePublicProfile(checked)}
                />
              </div>
            ) : null}

            <p className="pilot-settings-hint">
              Update marketplace profile details on the{" "}
              <Link href="/dashboard/pilot/profile">Profile</Link> page.
            </p>
          </section>

          <section id="pilot-settings-notifications" className="pilot-settings-card">
            <h2 className="pilot-settings-card-title">NOTIFICATION PREFERENCES</h2>
            <p className="pilot-settings-card-copy">
              In-app notifications are enabled. Email delivery will use SMTP in a later
              phase; alerts appear in your dashboard bell.
            </p>
            <p className="pilot-settings-stat">
              <span className="pilot-settings-stat-value">{account.unreadNotifications}</span>{" "}
              unread notification{account.unreadNotifications === 1 ? "" : "s"}
            </p>
            {account.unreadNotifications > 0 ? (
              <button
                type="button"
                className="pilot-settings-btn-outline"
                onClick={() => void markAllNotificationsRead()}
              >
                Mark all as read
              </button>
            ) : null}
            <p className="pilot-settings-hint">
              Per-category notification toggles are not wired for pilots yet — only inbox
              read state is integrated today.
            </p>
          </section>

          <section id="pilot-settings-payment" className="pilot-settings-card">
            <h2 className="pilot-settings-card-title">PAYMENT INFO</h2>
            <p className="pilot-settings-card-copy">
              Mission payouts and membership billing use separate flows from uniform shop
              orders. Stripe Connect payout settings are pending backend integration.
            </p>
            <div className="pilot-settings-link-row">
              <Link href="/dashboard/pilot/payments" className="pilot-settings-link-card">
                View earnings &amp; payouts
              </Link>
              <Link
                href="/dashboard/pilot/subscription"
                className="pilot-settings-link-card"
              >
                Manage membership billing
              </Link>
            </div>
          </section>

          <section id="pilot-settings-security" className="pilot-settings-card">
            <h2 className="pilot-settings-card-title">SECURITY</h2>
            <form
              onSubmit={(e) => void handlePasswordChange(e)}
              className="pilot-settings-password-form"
            >
              <label className="pilot-settings-field pilot-settings-field--full">
                <span className="pilot-settings-label">Current Password</span>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  className="pilot-settings-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </label>
              <div className="pilot-settings-field-grid">
                <label className="pilot-settings-field">
                  <span className="pilot-settings-label">New Password</span>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    className="pilot-settings-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>
                <label className="pilot-settings-field">
                  <span className="pilot-settings-label">Confirm New Password</span>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    className="pilot-settings-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="pilot-settings-btn-primary"
                disabled={changingPassword}
              >
                {changingPassword ? "Updating…" : "Update password"}
              </button>
            </form>
          </section>

          <section
            id="pilot-settings-danger"
            className="pilot-settings-card pilot-settings-card--danger"
          >
            <h2 className="pilot-settings-card-title pilot-settings-card-title--danger">
              DANGER ZONE
            </h2>
            <div className="pilot-settings-danger-row">
              <div>
                <p className="pilot-settings-danger-title">Delete account</p>
                <p className="pilot-settings-danger-copy">
                  Account deletion removes the profile from client visibility. You can
                  reactivate within 30 days and retain your grade. After 30 days the
                  account is permanently removed.
                </p>
              </div>
              <button
                type="button"
                className="pilot-settings-btn-danger-outline"
                onClick={() => setDeactivateOpen(true)}
              >
                Deactivate Account
              </button>
            </div>
          </section>
        </div>
      </div>

      <PilotDeactivateModal
        open={deactivateOpen}
        submitting={deactivating}
        onCancel={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivateConfirm}
      />
    </div>
  );
}
