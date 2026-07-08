"use client";

import Image from "next/image";
import { useState } from "react";
import { homeAssets } from "@/lib/marketing/home-assets";

type WaitlistLandingViewProps = {
  /** Tracks signup source in WaitlistEntry.source (e.g. launch-landing, waitlist.vercel.app). */
  source?: string;
  /** Cross-origin API for standalone Vercel deploy; defaults to same-origin /api/waitlist. */
  apiBaseUrl?: string;
  logoSrc?: string;
};

export function WaitlistLandingView({
  source = "launch-landing",
  apiBaseUrl,
  logoSrc = homeAssets.logo,
}: WaitlistLandingViewProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const endpoint = apiBaseUrl
    ? `${apiBaseUrl.replace(/\/$/, "")}/api/waitlist`
    : "/api/waitlist";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          roleInterest: "both",
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
    <div className="waitlist-landing-page">
      <div className="waitlist-landing-glow" aria-hidden />

      <div className="waitlist-landing-inner">
        <Image
          src={logoSrc}
          alt="Remote Air Service"
          width={128}
          height={128}
          className="waitlist-landing-logo"
          priority
        />

        <section className="waitlist-landing-panel" aria-label="Join the waitlist">
          <h1 className="figma-waitlist-title">Join the Waitlist</h1>
          <p className="figma-waitlist-body">
            We are currently accepting a limited number of both enterprise clients
            and pilots interested in &ldquo;Fast Forwarding&rdquo; through grades A-3
            and above. Join the waitlist for priority access to the marketplace.
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
              <label className="sr-only" htmlFor="waitlist-landing-email">
                Email address
              </label>
              <input
                id="waitlist-landing-email"
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
            <p className="waitlist-landing-error" role="alert">
              {error}
            </p>
          ) : null}
        </section>

        <p className="waitlist-landing-footnote">
          Remote Air Service · Pre-launch priority access
        </p>
      </div>
    </div>
  );
}
