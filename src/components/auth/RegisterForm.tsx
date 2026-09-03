"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

function initialRoleFromParams(
  param: string | null,
): RegisterableRole {
  if (param === "pilot" || param === "client") return param;
  return "client";
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<RegisterableRole>(() =>
    initialRoleFromParams(searchParams.get("role")),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      body: JSON.stringify({ email, password, role }),
    });

    const registerData = await registerRes.json();

    if (!registerRes.ok) {
      setLoading(false);
      setError(registerData.error ?? "Registration failed.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      setError("Account created but sign-in failed. Please log in.");
      return;
    }

    const dashboard =
      role === "pilot"
        ? "/dashboard/pilot/onboarding"
        : "/dashboard/client/onboarding";
    router.push(dashboard);
    router.refresh();
  }

  return (
    <div className="premium-panel p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Register as a client or licensed drone pilot.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error ? (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <fieldset>
          <legend className="text-sm font-medium">I am a</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {REGISTERABLE_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  role === r
                    ? "border-gold bg-gold/10 ring-1 ring-gold"
                    : "border-border hover:border-gold/50",
                )}
              >
                <span className="block text-sm font-semibold">
                  {roleLabels[r].title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {roleLabels[r].description}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" name="role" value={role} />
        </fieldset>

        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium">
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
            className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
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
          labelClassName="block text-sm font-medium"
          inputClassName="mt-0 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />
          <p className="mt-1 text-xs text-muted-foreground">
            At least 8 characters
          </p>

        <PasswordField
          id="reg-confirm"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={setConfirmPassword}
          labelClassName="block text-sm font-medium"
          inputClassName="mt-0 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gold-dark hover:text-gold">
          Log in
        </Link>
      </p>
    </div>
  );
}
