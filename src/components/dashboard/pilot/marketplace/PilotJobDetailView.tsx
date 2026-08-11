import Link from "next/link";
import { PilotProposalStatusBadge } from "@/components/dashboard/pilot/proposals/PilotProposalStatusBadge";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import {
  mapApplicationStatusToUi,
  proposalBadgeLabel,
} from "@/lib/pilot/proposals-map";
import { JOB_CATEGORIES } from "@/types/job";
import type { PilotJobDetailDto } from "@/types/application";

type PilotJobDetailViewProps = {
  detail: PilotJobDetailDto;
};

function categoryLabel(id: string): string {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Flexible / TBD";
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

export function PilotJobDetailView({ detail }: PilotJobDetailViewProps) {
  const { job, application, canApply, applyBlockedMessage } = detail;
  const budget = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);
  const uiStatus = application
    ? mapApplicationStatusToUi(application.status, application.shortlistedAt)
    : null;

  return (
    <div className="pilot-job-detail-page">
      <header className="pilot-job-detail-header pilot-marketplace-bracket-card">
        <Link href="/dashboard/pilot/jobs" className="pilot-job-detail-back">
          ← Back to marketplace
        </Link>
        <p className="pilot-job-detail-eyebrow">OPERATIONS / MARKETPLACE</p>
        <div className="pilot-job-detail-title-row">
          <h1 className="pilot-job-detail-title">{job.title}</h1>
          <span className="pilot-job-detail-category">
            {categoryLabel(job.category).toUpperCase()}
          </span>
        </div>
        <p className="pilot-job-detail-meta">
          {job.clientDisplayName}
          <span aria-hidden> · </span>
          {job.locationLabel}
        </p>
      </header>

      <div className="pilot-job-detail-grid">
        <section className="pilot-job-detail-card">
          <h2 className="pilot-job-detail-card-title">Mission details</h2>
          <dl className="pilot-job-detail-fields">
            <div>
              <dt>Client</dt>
              <dd>{job.clientDisplayName}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{categoryLabel(job.category)}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd className="pilot-job-detail-value-gold">{budget ?? "OPEN"}</dd>
            </div>
            <div>
              <dt>Scheduled</dt>
              <dd>{formatDate(job.scheduledDate)}</dd>
            </div>
          </dl>
          <div className="pilot-job-detail-copy">
            <h3>Description</h3>
            <p>{job.description}</p>
            {job.requirements ? (
              <>
                <h3>Requirements</h3>
                <p>{job.requirements}</p>
              </>
            ) : null}
          </div>
        </section>

        <aside className="pilot-job-detail-card pilot-job-detail-card--action">
          {application && uiStatus ? (
            <>
              <div className="pilot-job-detail-card-head">
                <h2 className="pilot-job-detail-card-title">Your proposal</h2>
                <PilotProposalStatusBadge
                  status={uiStatus}
                  label={proposalBadgeLabel(uiStatus)}
                />
              </div>
              <dl className="pilot-job-detail-fields pilot-job-detail-fields--stack">
                <div>
                  <dt>Proposed amount</dt>
                  <dd className="pilot-job-detail-value-gold">
                    {formatMoney(application.proposedAmount, application.currency)}
                  </dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{formatDate(application.submittedAt)}</dd>
                </div>
              </dl>
              {application.message ? (
                <div className="pilot-job-detail-copy">
                  <h3>Cover message</h3>
                  <p className="pilot-job-detail-pre">{application.message}</p>
                </div>
              ) : null}
              <Link
                href={`/dashboard/pilot/proposals/${application.id}`}
                className="pilot-job-detail-cta pilot-job-detail-cta--outline"
              >
                View proposal details →
              </Link>
            </>
          ) : canApply ? (
            <>
              <h2 className="pilot-job-detail-card-title">Ready to bid?</h2>
              <p className="pilot-job-detail-help">
                Open the full proposal form to submit your offer, deliverables, and
                availability.
              </p>
              {budget ? (
                <p className="pilot-job-detail-budget-note">
                  Client budget <strong>{budget}</strong>
                </p>
              ) : null}
              <Link
                href={`/dashboard/pilot/jobs/${job.id}/proposal`}
                className="pilot-job-detail-cta"
              >
                View &amp; Submit Proposal
              </Link>
            </>
          ) : (
            <>
              <h2 className="pilot-job-detail-card-title">Bidding not available</h2>
              <p className="pilot-job-detail-help">
                {applyBlockedMessage ??
                  "Your membership tier does not allow bidding on this job."}
              </p>
              <Link
                href="/dashboard/pilot/subscription"
                className="pilot-job-detail-link"
              >
                View membership tiers →
              </Link>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
