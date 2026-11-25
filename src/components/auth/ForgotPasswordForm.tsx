"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const inputCls = "ras-input mt-1";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevResetUrl(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        resetUrl?: string;
      };
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? "Could not send reset email.");
        return;
      }

      setMessage(
        data.message ??
          "If an account exists for that email, a password reset link was sent.",
      );
      if (typeof data.resetUrl === "string" && data.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch {
      setLoading(false);
      setError("Could not send reset email.");
    }
  }

  return (
    <div className="ras-auth-card">
      <p className="ras-panel-title">Account</p>
      <h1 className="ras-panel-heading mt-2">Forgot password</h1>
      <p className="ras-help">
        Enter your account email and we will send a one-hour reset link.
      </p>

      <form method="post" onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        {error ? (
          <p className="ras-alert ras-alert--danger" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="ras-alert ras-alert--success" role="status">
            {message}
          </p>
        ) : null}
        {devResetUrl ? (
          <p className="ras-help break-all" role="note">
            Dev only — open reset link:{" "}
            <Link href={devResetUrl} className="ras-link">
              Reset password
            </Link>
          </p>
        ) : null}

        <div className="ras-field">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--color-text)]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm ras-muted">
        Remembered it?{" "}
        <Link href="/login" className="ras-link">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
