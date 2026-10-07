"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { REGISTERABLE_ROLES, type RegisterableRole } from "@/types/roles";
import { cn } from "@/lib/utils";

const roleLabels: Record<RegisterableRole, { title: string; description: string }> = {
  client: {
    title: "Client",
    description: "Hire pilots for drone missions",
  },
  pilot: {
    title: "Pilot",
    description: "Find work and grow your business",
  },
};

const inputCls = "ras-input mt-1";

function initialRoleFromParams(
  param: string | null,
): RegisterableRole {
  if (param === "pilot" || param === "client") return param;
  return "client";
}

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<RegisterableRole>(() =>
    initialRoleFromParams(searchParams.get("role")),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(
    () => searchParams.get("invite")?.trim().toUpperCase() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingVerify, setPendingVerify] = useState<{
    email: string;
    message: string;
  } | null>(null);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role,
        inviteCode: inviteCode.trim() || undefined,
      }),
    });

    const registerData = await registerRes.json();
    setLoading(false);

    if (!registerRes.ok) {
      setError(registerData.error ?? "Registration failed.");
      return;
    }

    if (registerData.requiresEmailVerification) {
      setPendingVerify({
        email,
        message:
          registerData.message ??
          "Check your email for a confirmation link before logging in.",
      });
      return;
    }

    // Non-deliverable / auto-verified (local QA) — send to login.
    window.location.href = `/login?email=${encodeURIComponent(email)}`;
  }

  async function handleResend() {
    if (!pendingVerify) return;
    setResendBusy(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingVerify.email }),
      });
      const data = await res.json();
      setResendMsg(
        res.ok
          ? (data.message ?? "Verification email sent.")
          : (data.error ?? "Could not resend."),
      );
    } catch {
      setResendMsg("Could not resend.");
    } finally {
      setResendBusy(false);
    }
  }

  if (pendingVerify) {
    return (
      <div className="ras-auth-card text-center">
        <p className="ras-panel-title">Confirm email</p>
        <h1 className="ras-panel-heading mt-2">Check your inbox</h1>
        <p className="ras-help mt-3">{pendingVerify.message}</p>
        <p className="mt-2 text-sm text-[var(--color-text)]">
          Sent to <strong>{pendingVerify.email}</strong>
        </p>
        {resendMsg ? (
          <p className="ras-help mt-3" role="status">
            {resendMsg}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={resendBusy}
            onClick={handleResend}
          >
            {resendBusy ? "Sending…" : "Resend confirmation email"}
          </Button>
          <Link href="/login" className="ras-link text-sm">
            Go to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ras-auth-card">
      <p className="ras-panel-title">Account</p>
      <h1 className="ras-panel-heading mt-2">Create account</h1>
      <p className="ras-help">
        Register as a client or licensed drone pilot. Confirm your email to
        continue your profile.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error ? (
          <p className="ras-alert ras-alert--danger" role="alert">
            {error}
          </p>
        ) : null}

        <fieldset>
          <legend className="text-sm font-medium text-[var(--color-text)]">
            I am a
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {REGISTERABLE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-[var(--radius-control)] border p-3 text-left transition-colors",
                  role === r
                    ? "border-[var(--color-gold)] bg-[rgba(216,179,57,0.12)] ring-1 ring-[var(--color-gold)]"
                    : "border-[var(--dashboard-card-border)] bg-[var(--color-panel)] hover:border-[rgba(216,179,57,0.45)]",
                )}
              >
                <span className="block text-sm font-semibold text-[var(--color-text)]">
                  {roleLabels[r].title}
                </span>
                <span className="mt-0.5 block text-xs ras-muted">
                  {roleLabels[r].description}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" name="role" value={role} />
        </fieldset>

        <div className="ras-field">
          <label htmlFor="reg-email" className="block text-sm font-medium text-[var(--color-text)]">
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <PasswordField
          id="reg-password"
          name="password"
          label="Password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={setPassword}
          labelClassName="block text-sm font-medium text-[var(--color-text)]"
          inputClassName={inputCls}
        />
        <p className="ras-help !mt-1">At least 8 characters</p>

        <PasswordField
          id="reg-confirm"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={setConfirmPassword}
          labelClassName="block text-sm font-medium text-[var(--color-text)]"
          inputClassName={inputCls}
        />

        <div className="ras-field">
          <label
            htmlFor="reg-invite"
            className="block text-sm font-medium text-[var(--color-text)]"
          >
            Invite code <span className="ras-muted font-normal">(optional)</span>
          </label>
          <input
            id="reg-invite"
            name="inviteCode"
            type="text"
            autoComplete="off"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className={inputCls}
            placeholder="RAS-XXXXXXXX"
          />
          <p className="ras-help !mt-1">
            Invited members get 10% off membership for the first year.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm ras-muted">
        Already have an account?{" "}
        <Link href="/login" className="ras-link">
          Log in
        </Link>
      </p>
    </div>
  );
}
