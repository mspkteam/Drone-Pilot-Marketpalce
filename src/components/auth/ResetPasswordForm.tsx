"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { PASSWORD_RULES_HELP } from "@/lib/auth/validation";

const inputCls = "ras-input mt-1";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing reset token. Request a new link from the login page.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string; email?: string };
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "Could not reset password.");
        return;
      }

      const emailQs = data.email
        ? `?email=${encodeURIComponent(data.email)}&reset=1`
        : "?reset=1";
      router.push(`/login${emailQs}`);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Could not reset password.");
    }
  }

  if (!token) {
    return (
      <div className="ras-auth-card">
        <p className="ras-panel-title">Account</p>
        <h1 className="ras-panel-heading mt-2">Reset password</h1>
        <p className="ras-alert ras-alert--danger mt-6" role="alert">
          This reset link is missing or incomplete. Request a new one from the
          login page.
        </p>
        <p className="mt-6 text-center text-sm ras-muted">
          <Link href="/forgot-password" className="ras-link">
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="ras-auth-card">
      <p className="ras-panel-title">Account</p>
      <h1 className="ras-panel-heading mt-2">Choose a new password</h1>
      <p className="ras-help">{PASSWORD_RULES_HELP}</p>

      <form method="post" onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        {error ? (
          <p className="ras-alert ras-alert--danger" role="alert">
            {error}
          </p>
        ) : null}

        <PasswordField
          id="password"
          name="password"
          label="New password"
          autoComplete="new-password"
          required
          value={password}
          onChange={setPassword}
          labelClassName="block text-sm font-medium text-[var(--color-text)]"
          inputClassName={inputCls}
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm new password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={setConfirmPassword}
          labelClassName="block text-sm font-medium text-[var(--color-text)]"
          inputClassName={inputCls}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm ras-muted">
        <Link href="/login" className="ras-link">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
