"use client";

import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { resolvePostLoginRedirect } from "@/lib/auth/permissions";
import type { UserRole } from "@/types/roles";

const inputCls = "ras-input mt-1";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    const prefillEmail = searchParams.get("email");
    const prefillPassword = searchParams.get("password");
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillPassword) setPassword(prefillPassword);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerify(false);
    setResendMsg(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      const code = (result as { code?: string }).code ?? result.error;
      if (
        code === "email_not_verified" ||
        String(result.error).toLowerCase().includes("email_not_verified")
      ) {
        setNeedsVerify(true);
        setError(
          "Confirm your email before logging in. Check your inbox for the verification link.",
        );
        return;
      }
      setError("Invalid email or password.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as UserRole | undefined;
    const destination = role
      ? resolvePostLoginRedirect(role, callbackUrl)
      : "/login";

    router.push(destination);
    router.refresh();
  }

  async function handleResend() {
    setResendBusy(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendMsg(
        res.ok
          ? (data.message ?? "If an unverified account exists, a new link was sent.")
          : (data.error ?? "Could not resend."),
      );
    } catch {
      setResendMsg("Could not resend.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className="ras-auth-card">
      <p className="ras-panel-title">Account</p>
      <h1 className="ras-panel-heading mt-2">Log in</h1>
      <p className="ras-help">
        Access your pilot, client, or admin dashboard.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error ? (
          <p className="ras-alert ras-alert--danger" role="alert">
            {error}
          </p>
        ) : null}
        {resendMsg ? (
          <p className="ras-help" role="status">
            {resendMsg}
          </p>
        ) : null}

        <div className="ras-field">
          <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)]">
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
          />
        </div>

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={setPassword}
          labelClassName="block text-sm font-medium text-[var(--color-text)]"
          inputClassName={inputCls}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>

        {needsVerify ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={resendBusy || !email}
            onClick={handleResend}
          >
            {resendBusy ? "Sending…" : "Resend confirmation email"}
          </Button>
        ) : null}
      </form>

      <p className="mt-6 text-center text-sm ras-muted">
        No account?{" "}
        <Link href="/waitlist" className="ras-link">
          Join the waitlist
        </Link>
        {" · "}
        <Link href="/register" className="ras-link">
          Register
        </Link>
      </p>
    </div>
  );
}
