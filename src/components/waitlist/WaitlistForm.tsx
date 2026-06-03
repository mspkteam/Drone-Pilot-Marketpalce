"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { getWaitlistRoleLabel } from "@/lib/waitlist/status";
import type { WaitlistRoleInterest } from "@/types/waitlist";
import { WAITLIST_ROLE_INTERESTS } from "@/types/waitlist";

export function WaitlistForm() {
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get("source") ?? searchParams.get("utm_source");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleInterest, setRoleInterest] = useState<WaitlistRoleInterest>("pilot");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          email,
          roleInterest,
          region: region || null,
          source: sourceParam,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not join waitlist.");
        return;
      }
      setAlreadySubscribed(!!data.alreadySubscribed);
      setSuccess(true);
    } catch {
      setError("Could not join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-6 text-sm text-gold-dark">
        <p className="font-medium" role="status">
          {alreadySubscribed
            ? "You're already on our waitlist."
            : "You're on the waitlist!"}
        </p>
        <p className="mt-2">
          We&apos;ll email {email} when new regions and features launch.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/register?role=pilot" size="sm">
            Register as pilot
          </Button>
          <Button href="/register?role=client" variant="outline" size="sm">
            Register as client
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Marketplace is live in demo — you can sign up now instead of waiting.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Join the waitlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Get early access updates for new regions, pilot tools, and client features.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        <FormField label="Email" htmlFor="waitlist-email" required>
          <input
            id="waitlist-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Name (optional)" htmlFor="waitlist-name">
          <input
            id="waitlist-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="I am interested as" htmlFor="waitlist-role" required>
          <select
            id="waitlist-role"
            required
            value={roleInterest}
            onChange={(e) =>
              setRoleInterest(e.target.value as WaitlistRoleInterest)
            }
            className={inputClassName}
          >
            {WAITLIST_ROLE_INTERESTS.map((r) => (
              <option key={r} value={r}>
                {getWaitlistRoleLabel(r)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Region or city (optional)"
          htmlFor="waitlist-region"
          hint="Helps us prioritize launch in your area."
        >
          <input
            id="waitlist-region"
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. Austin, TX"
            className={inputClassName}
          />
        </FormField>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Joining…" : "Join waitlist"}
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
