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
      className="figma-home-waitlist"
      aria-label="Join the waitlist"
    >
      <div className="figma-waitlist-inner public-container">
        <div className="figma-waitlist-stack">
          <h2 className="figma-waitlist-title w-full text-center">
            Join the Waitlist
          </h2>
          <p className="figma-waitlist-body w-full text-center">
            We are currently accepting a limited number of both enterprise clients
            and pilots interested in “Fast Forwarding” through grades A-3 and above.
            Join the waitlist for priority access to the marketplace.
          </p>

          {success ? (
            <p className="figma-waitlist-success" role="status">
              You&apos;re on the waitlist. We&apos;ll email you when priority access
              opens.
            </p>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="figma-waitlist-form"
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
                className="figma-waitlist-input"
              />
              <button
                type="submit"
                disabled={loading}
                className="figma-waitlist-submit"
              >
                {loading ? "Joining…" : "Join the waitlist"}
              </button>
            </form>
          )}

          {error ? (
            <p
              className="w-full text-center text-sm font-medium text-[var(--color-waitlist-heading)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
