"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PayoutStatus =
  | "not_started"
  | "pending"
  | "needs_info"
  | "complete"
  | "restricted";

const STATUS_META: Record<
  PayoutStatus,
  { label: string; description: string }
> = {
  not_started: {
    label: "Not started",
    description: "Connect a payout account to receive earnings from completed jobs.",
  },
  pending: {
    label: "Pending",
    description: "Stripe is reviewing your details. This usually takes a few minutes.",
  },
  complete: {
    label: "Complete",
    description: "Identity and bank details verified. You can receive job payouts.",
  },
  needs_info: {
    label: "Needs info",
    description:
      "Stripe needs more information before payouts can be enabled. Finish setup to continue.",
  },
  restricted: {
    label: "Restricted",
    description:
      "Payouts are paused until the issue on your payout account is resolved. Contact support if you need help.",
  },
};

const STEPS = [
  {
    title: "Pay membership and complete your profile",
    body: "Pay your annual membership and finish your profile before connecting payouts.",
  },
  {
    title: "Open Payouts and select Set up payouts",
    body: "Open the Payouts page in your dashboard and select Set up payouts.",
  },
  {
    title: "Complete Stripe’s secure page",
    body: "Enter your details on Stripe’s secure page (government ID, bank details, tax ID, address, date of birth, phone). RAS does not store your bank details.",
  },
  {
    title: "Return and confirm status is Complete",
    body: "Return to RAS when Stripe finishes. Check that your status shows Complete so you can receive job payouts.",
  },
] as const;

const STATUS_ORDER: PayoutStatus[] = ["needs_info", "complete", "restricted"];

export function PilotPayoutSetupView() {
  const [status, setStatus] = useState<PayoutStatus>("not_started");
  const [notice, setNotice] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const meta = STATUS_META[status];

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pilot/payouts/connect")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setConfigured(Boolean(data.configured));
        if (data.configured && data.status) setStatus(data.status as PayoutStatus);
      })
      .catch(() => {
        if (!cancelled) setConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSetup() {
    if (!configured) {
      setNotice(
        "Stripe is not configured on this environment. For testing, status has been set to Complete (demo only).",
      );
      setStatus("complete");
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/pilot/payouts/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setNotice(data.error ?? "Could not start payout setup.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setNotice("Could not start payout setup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pilot-payouts-page">
      <header className="pilot-payouts-header">
        <div>
          <p className="pilot-payouts-eyebrow">BUSINESS / PAYOUTS</p>
          <h1 className="pilot-payouts-title">Payout setup</h1>
          <p className="pilot-payouts-subtitle">
            Connect a payout account to receive earnings from completed jobs.
          </p>
        </div>
        <Link href="/dashboard/pilot/payments" className="pilot-payouts-btn-outline">
          ← Earnings
        </Link>
      </header>

      {notice ? (
        <p className="pilot-payouts-banner" role="status">
          {notice}
        </p>
      ) : null}

      <section className="pilot-payouts-panel" aria-label="Payout account status">
        <div className="pilot-payouts-status-row">
          <div>
            <h2 className="pilot-payouts-panel-title">Payout account status</h2>
            <p className="pilot-payouts-text">{meta.description}</p>
          </div>
          <span className={`pilot-payouts-badge pilot-payouts-badge--${status}`}>
            {meta.label}
          </span>
        </div>

        <div className="pilot-payouts-actions">
          <button
            type="button"
            className="pilot-payouts-btn-gold"
            onClick={() => void handleSetup()}
            disabled={busy || status === "complete"}
          >
            {status === "complete"
              ? "Payouts set up"
              : busy
                ? "Opening Stripe…"
                : status === "not_started"
                  ? "Set up payouts"
                  : "Continue payout setup"}
          </button>
          {status === "complete" && !configured ? (
            <button
              type="button"
              className="pilot-payouts-btn-outline"
              onClick={() => {
                setStatus("needs_info");
                setNotice(null);
              }}
            >
              Reset demo status
            </button>
          ) : null}
        </div>

        {configured === false ? (
          <>
            <p className="pilot-payouts-hint">
              Demo preview only — Stripe is not configured here. Preview other states:
            </p>
            <div className="pilot-payouts-demo">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`pilot-payouts-chip${s === status ? " pilot-payouts-chip--active" : ""}`}
                  onClick={() => setStatus(s)}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section className="pilot-payouts-panel" aria-label="How payout setup works">
        <h2 className="pilot-payouts-panel-title">How it works</h2>
        <ol className="pilot-payouts-steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="pilot-payouts-step">
              <span className="pilot-payouts-step-num">{i + 1}</span>
              <div>
                <p className="pilot-payouts-step-title">{step.title}</p>
                <p className="pilot-payouts-text">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pilot-payouts-panel" aria-label="Tax and identity">
        <h2 className="pilot-payouts-panel-title">Tax &amp; identity information</h2>
        <p className="pilot-payouts-text">
          Tax and identity details are collected securely by Stripe during payout
          setup. They are not entered or stored on Remote Air Service.
        </p>
        <p className="pilot-payouts-hint">
          Status: {status === "complete" ? "Collected via Stripe" : "Not yet collected"}
        </p>
      </section>
    </div>
  );
}
