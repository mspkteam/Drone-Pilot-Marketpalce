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

  useEffect(() => {
    const prefillEmail = searchParams.get("email");
    const prefillPassword = searchParams.get("password");
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillPassword) setPassword(prefillPassword);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
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
      </form>

      <p className="mt-6 text-center text-sm ras-muted">
        No account?{" "}
        <Link href="/waitlist" className="ras-link">
          Join the waitlist
        </Link>
      </p>
    </div>
  );
}
