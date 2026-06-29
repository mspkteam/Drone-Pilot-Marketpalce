"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PilotProposalStatusBadge } from "@/components/dashboard/pilot/proposals/PilotProposalStatusBadge";
import { canWithdrawApplication } from "@/lib/applications/status";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import {
  mapApplicationStatusToUi,
  proposalBadgeLabel,
} from "@/lib/pilot/proposals-map";
import { pricingBreakdownTotal } from "@/lib/applications/proposal-metadata";
import { JOB_CATEGORIES } from "@/types/job";
import type { PilotProposalDetailDto } from "@/types/application";

type PilotProposalDetailViewProps = {
  initial: PilotProposalDetailDto;
};

function categoryLabel(id: string): string {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function formatDate(iso: string | null): string {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function PilotProposalDetailView({ initial }: PilotProposalDetailViewProps) {
  const router = useRouter();
  const [application, setApplication] = useState(initial);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uiStatus = mapApplicationStatusToUi(
    application.status,
    application.shortlistedAt,
  );
  const badgeLabel = proposalBadgeLabel(uiStatus);
  const details = application.proposalDetails;
  const budget = formatJobBudget(
    application.job.budgetMin,
    application.job.budgetMax,
    application.job.currency,
  );
  const canWithdraw = canWithdrawApplication(application.status);

  async function handleWithdraw() {
    if (!canWithdraw || withdrawing) return;
    const confirmed = window.confirm(
      "Withdraw this proposal? The client will no longer see your offer.",
    );
    if (!confirmed) return;

    setError(null);
    setWithdrawing(true);
    try {
      const res = await fetch(`/api/pilot/applications/${application.id}/withdraw`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to withdraw proposal.");
        return;
      }
      setApplication((current) => ({
        ...current,
        status: data.application.status,
        updatedAt: data.application.updatedAt,
      }));
      router.refresh();
    } catch {
      setError("Failed to withdraw proposal.");
    } finally {
      setWithdrawing(false);
    }
  }

  const pricingTotal = details?.pricingBreakdown
    ? pricingBreakdownTotal(details.pricingBreakdown)
    : application.proposedAmount;

  return (
    <div className="pilot-submit-page">
      <header className="pilot-submit-header">
        <div className="pilot-submit-header-nav">
          <Link href="/dashboard/pilot/proposals" className="pilot-submit-back">
            ← Back to My Proposals
          </Link>
        </div>
        <p className="pilot-submit-eyebrow">OPERATIONS / PROPOSALS</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
          <h1 className="pilot-submit-title" style={{ margin: 0 }}>
            {application.job.title}
          </h1>
          <PilotProposalStatusBadge status={uiStatus} label={badgeLabel} />
        </div>
        <p className="pilot-submit-desc">
          {application.job.locationLabel} · Submitted {formatDate(application.submittedAt)}
        </p>
      </header>

      {error ? (
        <p className="pilot-submit-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="pilot-submit-main">
        <section className="pilot-submit-job-card">
          <h2 className="pilot-submit-form-title">Mission</h2>
          <dl className="pilot-submit-job-meta">
            <div>
              <dt>Client</dt>
              <dd>{application.job.clientDisplayName}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{categoryLabel(application.job.category)}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{budget ?? "TBD"}</dd>
            </div>
            <div>
              <dt>Scheduled</dt>
              <dd>{formatDate(application.job.scheduledDate)}</dd>
            </div>
          </dl>
          <div className="pilot-submit-job-copy" style={{ marginTop: "1rem" }}>
            <div>
              <h3>Description</h3>
              <p>{application.job.description}</p>
            </div>
            {application.job.requirements ? (
              <div>
                <h3>Requirements</h3>
                <p>{application.job.requirements}</p>
              </div>
            ) : null}
          </div>
          <Link
            href={`/dashboard/pilot/jobs/${application.jobId}`}
            className="pilot-submit-side-link"
            style={{ display: "inline-block", marginTop: "1rem" }}
          >
            View marketplace listing →
          </Link>
        </section>

        <section className="pilot-submit-job-card">
          <h2 className="pilot-submit-form-title">Proposal summary</h2>
          <dl className="pilot-proposal-detail-grid pilot-proposal-detail-dl">
            <div>
              <dt>Proposed amount</dt>
              <dd>{formatMoney(application.proposedAmount, application.currency)}</dd>
            </div>
            <div>
              <dt>Estimated delivery</dt>
              <dd>{formatDate(application.estimatedDeliveryDate)}</dd>
            </div>
            {details?.availability ? (
              <div>
                <dt>Availability</dt>
                <dd>{details.availability}</dd>
              </div>
            ) : null}
            {details?.deliverables?.length ? (
              <div>
                <dt>Deliverables</dt>
                <dd>{details.deliverables.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
          {application.message ? (
            <>
              <h3 className="pilot-submit-subcard-title" style={{ marginTop: "1.25rem" }}>
                Cover message
              </h3>
              <p className="pilot-submit-desc" style={{ whiteSpace: "pre-wrap" }}>
                {application.message}
              </p>
            </>
          ) : null}
          {details?.experience ? (
            <>
              <h3 className="pilot-submit-subcard-title" style={{ marginTop: "1.25rem" }}>
                Experience
              </h3>
              <p className="pilot-submit-desc" style={{ whiteSpace: "pre-wrap" }}>
                {details.experience}
              </p>
            </>
          ) : null}
        </section>

        {details?.operationalPlan ? (
          <section className="pilot-submit-subcard">
            <h3 className="pilot-submit-subcard-title">Operational plan</h3>
            <dl className="pilot-proposal-detail-grid pilot-proposal-detail-dl">
              <div>
                <dt>Projected mileage</dt>
                <dd>{details.operationalPlan.projectedMileage}</dd>
              </div>
              <div>
                <dt>Flight time</dt>
                <dd>{details.operationalPlan.flightTimeEstimate}</dd>
              </div>
              <div>
                <dt>Flights</dt>
                <dd>{details.operationalPlan.numberOfFlights}</dd>
              </div>
              <div>
                <dt>Crew</dt>
                <dd>{details.operationalPlan.crewCount}</dd>
              </div>
              <div>
                <dt>Equipment</dt>
                <dd>{details.operationalPlan.droneEquipment}</dd>
              </div>
              {details.operationalPlan.groundSupport ? (
                <div>
                  <dt>Ground support</dt>
                  <dd>{details.operationalPlan.groundSupport}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}

        {details?.compliance ? (
          <section className="pilot-submit-subcard">
            <h3 className="pilot-submit-subcard-title">Compliance &amp; travel</h3>
            <dl className="pilot-proposal-detail-dl">
              <div>
                <dt>Permits / waivers</dt>
                <dd>{details.compliance.permitsWaivers}</dd>
              </div>
              <div>
                <dt>Travel / lodging</dt>
                <dd>{details.compliance.travelLodging}</dd>
              </div>
              <div>
                <dt>Safety plan</dt>
                <dd>{details.compliance.safetyPlan}</dd>
              </div>
              {details.assumptions ? (
                <div>
                  <dt>Additional notes</dt>
                  <dd>{details.assumptions}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : null}

        {details?.pricingBreakdown ? (
          <section className="pilot-submit-subcard">
            <h3 className="pilot-submit-subcard-title">Pricing breakdown</h3>
            <dl className="pilot-proposal-detail-grid pilot-proposal-detail-dl">
              <div>
                <dt>Flight operations</dt>
                <dd>
                  {formatMoney(details.pricingBreakdown.flightOperations, application.currency)}
                </dd>
              </div>
              <div>
                <dt>Travel mileage</dt>
                <dd>
                  {formatMoney(details.pricingBreakdown.travelMileage, application.currency)}
                </dd>
              </div>
              <div>
                <dt>Equipment / batteries</dt>
                <dd>
                  {formatMoney(details.pricingBreakdown.equipmentBatteries, application.currency)}
                </dd>
              </div>
              <div>
                <dt>Planning / delivery</dt>
                <dd>
                  {formatMoney(details.pricingBreakdown.planningDelivery, application.currency)}
                </dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatMoney(pricingTotal, application.currency)}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {details?.portfolioLinks?.length ? (
          <section className="pilot-submit-job-card">
            <h2 className="pilot-submit-form-title">Portfolio links</h2>
            <ul className="pilot-submit-steps" style={{ listStyle: "none", paddingLeft: 0 }}>
              {details.portfolioLinks.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noreferrer" className="pilot-submit-side-link">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {canWithdraw ? (
          <section className="pilot-submit-job-card">
            <h2 className="pilot-submit-form-title">Withdraw proposal</h2>
            <p className="pilot-submit-desc">
              Remove your pending offer from client review. This cannot be undone.
            </p>
            <button
              type="button"
              className="pilot-proposal-withdraw-btn"
              disabled={withdrawing}
              onClick={() => void handleWithdraw()}
            >
              {withdrawing ? "Withdrawing…" : "Withdraw proposal"}
            </button>
          </section>
        ) : null}
      </div>
    </div>
  );
}
