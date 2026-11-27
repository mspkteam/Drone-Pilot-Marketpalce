"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BACKGROUND_CHECK_DEADLINE_DAYS,
  BACKGROUND_CHECK_FEE_USD,
} from "@/lib/background-check/rules";
import {
  BACKGROUND_CHECK_STATUS_LABELS,
  type PilotBackgroundCheckDto,
} from "@/types/background-check";

function fmt(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString() : "—";
}

export function PilotBackgroundCheckView() {
  const [check, setCheck] = useState<PilotBackgroundCheckDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/pilot/background-check");
    const data = (await res.json()) as {
      check?: PilotBackgroundCheckDto;
      checkoutUrl?: string;
      error?: string;
    };
    if (res.ok && data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    if (!res.ok || !data.check) {
      setError(data.error ?? "Could not load background check.");
    } else {
      setCheck(data.check);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function pay() {
    setPaying(true);
    setError(null);
    const res = await fetch("/api/pilot/background-check/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent }),
    });
    const data = (await res.json()) as {
      check?: PilotBackgroundCheckDto;
      checkoutUrl?: string;
      error?: string;
    };
    if (res.ok && data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    if (!res.ok || !data.check) {
      setError(data.error ?? "Payment failed.");
    } else {
      setCheck(data.check);
    }
    setPaying(false);
  }

  if (loading) return <p className="bgc-muted">Loading…</p>;

  return (
    <div className="bgc-root">
      <section className="bgc-card">
        <p className="bgc-eyebrow">Pilot compliance</p>
        <h1 className="bgc-title">
          Pilot <span>Background Check</span>
        </h1>
        <p className="bgc-text">
          Remote Air Service performs a manual background check, including FAA
          license verification, for every pilot. It is a one-time $
          {BACKGROUND_CHECK_FEE_USD} fee, available after your membership is
          active and your profile is approved.
        </p>
        <ul className="bgc-list">
          <li>
            Complete the check within {BACKGROUND_CHECK_DEADLINE_DAYS} days of
            profile approval.
          </li>
          <li>
            Without a cleared check after that, proposals and hiring are paused.
          </li>
          <li>Our team reviews manually — no third-party service is used.</li>
        </ul>
      </section>

      {error ? <p className="bgc-error">{error}</p> : null}

      {check ? (
        <section className="bgc-card">
          <p className="bgc-eyebrow">Status</p>
          <p style={{ marginTop: 10 }}>
            <span className={`bgc-badge bgc-badge--${check.status}`}>
              {BACKGROUND_CHECK_STATUS_LABELS[check.status]}
            </span>
          </p>

          {check.marketplacePaused ? (
            <div className="bgc-alert" role="alert">
              Marketplace access is paused: you cannot submit proposals or be
              hired until your background check is cleared.
            </div>
          ) : null}

          <dl className="bgc-grid">
            <div className="bgc-stat">
              <dt>Fee</dt>
              <dd>${check.feeUsd}</dd>
            </div>
            <div className="bgc-stat">
              <dt>Deadline</dt>
              <dd>{fmt(check.deadlineAt)}</dd>
            </div>
            <div className="bgc-stat">
              <dt>Days remaining</dt>
              <dd>
                {check.status === "cleared" ? "—" : check.daysRemaining}
              </dd>
            </div>
            <div className="bgc-stat">
              <dt>Paid</dt>
              <dd>{fmt(check.paidAt)}</dd>
            </div>
            <div className="bgc-stat">
              <dt>FAA license</dt>
              <dd>
                {check.faaVerifiedAt
                  ? `Verified ${fmt(check.faaVerifiedAt)}`
                  : "Pending"}
              </dd>
            </div>
          </dl>

          {check.status === "not_started" ? (
            <>
              <label className="bgc-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  I consent to Remote Air Service conducting a background check,
                  including verification of my FAA license, and understand the $
                  {BACKGROUND_CHECK_FEE_USD} fee is non-refundable.
                </span>
              </label>
              {check.payBlockReason ? (
                <p className="bgc-error">{check.payBlockReason}</p>
              ) : null}
              <button
                type="button"
                className="bgc-btn"
                disabled={!consent || !check.canPay || paying}
                onClick={() => void pay()}
              >
                {paying ? "Processing…" : `Pay $${check.feeUsd} (demo)`}
              </button>
              <p className="bgc-muted" style={{ marginTop: 8 }}>
                Demo payment — no card is charged. Stripe checkout comes later.
              </p>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
