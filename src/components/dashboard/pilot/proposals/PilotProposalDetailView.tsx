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
    <div className="pilot-proposal-detail-page">
      <header className="pilot-proposal-detail-header pilot-proposals-bracket-card">
        <Link href="/dashboard/pilot/proposals" className="pilot-proposal-detail-back">
          ← Back to My Proposals
        </Link>
        <p className="pilot-proposal-detail-eyebrow">OPERATIONS / PROPOSALS</p>
        <div className="pilot-proposal-detail-title-row">
          <h1 className="pilot-proposal-detail-title">{application.job.title}</h1>
          <PilotProposalStatusBadge status={uiStatus} label={badgeLabel} />
        </div>
        <p className="pilot-proposal-detail-meta">
          {application.job.locationLabel}
          <span aria-hidden> · </span>
          Submitted {formatDate(application.submittedAt)}
          <span aria-hidden> · </span>
          {application.job.clientDisplayName}
        </p>
      </header>

      {error ? (
        <p className="pilot-proposals-banner pilot-proposals-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="pilot-proposal-detail-grid-layout">
        <section className="pilot-proposal-detail-card">
          <div className="pilot-proposal-detail-card-head">
            <h2 className="pilot-proposal-detail-card-title">Mission</h2>
            <Link
              href={`/dashboard/pilot/jobs/${application.jobId}`}
              className="pilot-proposal-detail-link"
            >
              View listing →
            </Link>
          </div>
          <dl className="pilot-proposal-detail-fields">
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
              <dd className="pilot-proposal-detail-value-gold">{budget ?? "TBD"}</dd>
            </div>
            <div>
              <dt>Scheduled</dt>
              <dd>{formatDate(application.job.scheduledDate)}</dd>
            </div>
          </dl>
          <div className="pilot-proposal-detail-copy">
            <h3>Description</h3>
            <p>{application.job.description}</p>
            {application.job.requirements ? (
              <>
                <h3>Requirements</h3>
                <p>{application.job.requirements}</p>
              </>
            ) : null}
          </div>
        </section>

        <section className="pilot-proposal-detail-card">
          <h2 className="pilot-proposal-detail-card-title">Proposal summary</h2>
          <dl className="pilot-proposal-detail-fields">
            <div>
              <dt>Proposed amount</dt>
              <dd className="pilot-proposal-detail-value-gold">
                {formatMoney(application.proposedAmount, application.currency)}
              </dd>
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
              <div className="pilot-proposal-detail-fields-span">
                <dt>Deliverables</dt>
                <dd>{details.deliverables.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
          {application.message ? (
            <div className="pilot-proposal-detail-copy">
              <h3>Cover message</h3>
              <p className="pilot-proposal-detail-pre">{application.message}</p>
            </div>
          ) : null}
          {details?.experience ? (
            <div className="pilot-proposal-detail-copy">
              <h3>Experience</h3>
              <p className="pilot-proposal-detail-pre">{details.experience}</p>
            </div>
          ) : null}
        </section>
      </div>

      {details?.operationalPlan ? (
        <section className="pilot-proposal-detail-card">
          <h2 className="pilot-proposal-detail-card-title">Operational plan</h2>
          <dl className="pilot-proposal-detail-fields">
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
            <div className="pilot-proposal-detail-fields-span">
              <dt>Equipment</dt>
              <dd>{details.operationalPlan.droneEquipment}</dd>
            </div>
            {details.operationalPlan.groundSupport ? (
              <div className="pilot-proposal-detail-fields-span">
                <dt>Ground support</dt>
                <dd>{details.operationalPlan.groundSupport}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {details?.compliance ? (
        <section className="pilot-proposal-detail-card">
          <h2 className="pilot-proposal-detail-card-title">Compliance &amp; travel</h2>
          <dl className="pilot-proposal-detail-stack">
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
        <section className="pilot-proposal-detail-card">
          <h2 className="pilot-proposal-detail-card-title">Pricing breakdown</h2>
          <dl className="pilot-proposal-detail-fields">
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
                {formatMoney(
                  details.pricingBreakdown.equipmentBatteries,
                  application.currency,
                )}
              </dd>
            </div>
            <div>
              <dt>Planning / delivery</dt>
              <dd>
                {formatMoney(details.pricingBreakdown.planningDelivery, application.currency)}
              </dd>
            </div>
            <div className="pilot-proposal-detail-fields-span">
              <dt>Total</dt>
              <dd className="pilot-proposal-detail-value-gold">
                {formatMoney(pricingTotal, application.currency)}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      {details?.portfolioLinks?.length ? (
        <section className="pilot-proposal-detail-card">
          <h2 className="pilot-proposal-detail-card-title">Portfolio links</h2>
          <ul className="pilot-proposal-detail-links">
            {details.portfolioLinks.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="pilot-proposal-detail-link"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {canWithdraw ? (
        <section className="pilot-proposal-detail-card pilot-proposal-detail-card--danger">
          <h2 className="pilot-proposal-detail-card-title">Withdraw proposal</h2>
          <p className="pilot-proposal-detail-help">
            Remove your pending offer from client review. This cannot be undone.
          </p>
          <button
            type="button"
            className="pilot-proposal-detail-withdraw"
            disabled={withdrawing}
            onClick={() => void handleWithdraw()}
          >
            {withdrawing ? "Withdrawing…" : "Withdraw proposal"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
