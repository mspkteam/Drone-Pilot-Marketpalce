"use client";

import { useState } from "react";
import type { WaitlistRoleInterest } from "@/types/waitlist";

type MarketingWaitlistSectionProps = {
  source?: string;
  id?: string;
  roleInterest?: WaitlistRoleInterest;
};

export function MarketingWaitlistSection({
  source = "marketing",
  id = "waitlist",
  roleInterest = "client",
}: MarketingWaitlistSectionProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          roleInterest,
          source,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not join waitlist.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Could not join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id={id}
      className="figma-home-waitlist border-t border-ras-border-muted"
      aria-label="Join the waitlist"
    >
      <div className="public-container py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight text-ras-waitlist sm:text-4xl lg:text-[3.25rem]">
            Join the Waitlist
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ras-waitlist/85 sm:text-lg">
            We are currently accepting a limited number of both enterprise clients
            and pilots interested in “Fast Forwarding” through grades A-3 and above.
            Join the waitlist for priority access to the marketplace.
          </p>

          {success ? (
            <p
              className="mt-10 rounded border border-ras-waitlist/20 bg-ras-waitlist/10 px-4 py-3 text-sm font-medium text-ras-waitlist"
              role="status"
            >
              You&apos;re on the waitlist. We&apos;ll email you when priority access opens.
            </p>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-center"
            >
              <label className="sr-only" htmlFor={`${id}-email`}>
                Email address
              </label>
              <input
                id={`${id}-email`}
                type="email"
                required
                autoComplete="email"
                placeholder="ENTER EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 min-w-0 flex-1 border border-ras-border-muted bg-surface px-6 text-sm uppercase tracking-wide text-foreground placeholder:text-muted-foreground focus:border-ras-waitlist/40 focus:outline-none focus:ring-2 focus:ring-ras-waitlist/25"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-14 shrink-0 bg-surface px-10 text-xs font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-60"
              >
                {loading ? "Joining…" : "Join the waitlist"}
              </button>
            </form>
          )}

          {error ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
