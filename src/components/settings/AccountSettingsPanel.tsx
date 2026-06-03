"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import type { AccountDto } from "@/types/account";
import type { PilotProfileDto } from "@/types/pilot";

type AccountSettingsPanelProps = {
  role: "client" | "pilot";
  profileHref: string;
};

const ROLE_LABELS: Record<string, string> = {
  client: "Client",
  pilot: "Pilot",
  moderator: "Moderator",
  super_admin: "Super Admin",
};

export function AccountSettingsPanel({
  role,
  profileHref,
}: AccountSettingsPanelProps) {
  const [account, setAccount] = useState<AccountDto | null>(null);
  const [pilotProfile, setPilotProfile] = useState<PilotProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingPublic, setSavingPublic] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [accountRes, profileRes] = await Promise.all([
        fetch("/api/account"),
        role === "pilot" ? fetch("/api/pilot/profile") : Promise.resolve(null),
      ]);
      const accountData = await accountRes.json();
      if (!accountRes.ok) {
        setError(accountData.error ?? "Failed to load account.");
        setAccount(null);
      } else {
        setAccount(accountData.account);
      }

      if (profileRes) {
        const profileData = await profileRes.json();
        if (profileRes.ok && profileData.profile) {
          setPilotProfile(profileData.profile);
        }
      }
    } catch {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

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

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  if (!account) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error ?? "Account not available."}
      </p>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-700" role="status">
          {success}
        </p>
      ) : null}

      <section className="rounded-lg border border-border bg-surface-elevated p-5 space-y-3">
        <h2 className="font-semibold">Account</h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{account.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role</dt>
            <dd>{ROLE_LABELS[account.role] ?? account.role}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="capitalize">{account.status}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Member since</dt>
            <dd>{new Date(account.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
        <p className="text-sm text-muted-foreground">
          Update your marketplace profile on the{" "}
          <Link href={profileHref} className="text-gold-dark hover:underline">
            Profile
          </Link>{" "}
          page.
        </p>
      </section>

      {role === "pilot" && pilotProfile ? (
        <section className="rounded-lg border border-border bg-surface-elevated p-5 space-y-3">
          <h2 className="font-semibold">Public profile</h2>
          <p className="text-sm text-muted-foreground">
            When enabled, approved pilots appear on the public directory at{" "}
            <Link href="/pilots" className="text-gold-dark hover:underline">
              /pilots
            </Link>
            .
          </p>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={pilotProfile.isPublic}
              disabled={savingPublic || pilotProfile.status !== "approved"}
              onChange={(e) => void togglePublicProfile(e.target.checked)}
              className="size-4 rounded border-border text-gold focus:ring-gold"
            />
            <span>
              Show my profile publicly
              {pilotProfile.status !== "approved"
                ? " (available after admin approval)"
                : null}
            </span>
          </label>
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-surface-elevated p-5 space-y-4">
        <h2 className="font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          In-app notifications are enabled. Email delivery will use SMTP in a
          later phase; for now alerts appear in your dashboard bell.
        </p>
        <p className="text-sm">
          <span className="font-medium">{account.unreadNotifications}</span>{" "}
          unread notification
          {account.unreadNotifications === 1 ? "" : "s"}
        </p>
        {account.unreadNotifications > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void markAllNotificationsRead()}
          >
            Mark all as read
          </Button>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-surface-elevated p-5">
        <h2 className="font-semibold">Change password</h2>
        <form
          onSubmit={(e) => void handlePasswordChange(e)}
          className="mt-4 space-y-4"
        >
          <FormField label="Current password" htmlFor="current-password">
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              className={inputClassName}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormField>
          <FormField label="New password" htmlFor="new-password">
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              className={inputClassName}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirm-password">
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              className={inputClassName}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </FormField>
          <Button type="submit" disabled={changingPassword}>
            {changingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>
    </div>
  );
}
