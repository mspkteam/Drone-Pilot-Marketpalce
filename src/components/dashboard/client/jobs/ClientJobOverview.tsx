import Link from "next/link";
import { ClientDashboardCard } from "@/components/dashboard/client/ClientDashboardCard";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import {
  buildClientJobOverviewDetails,
  buildClientJobOverviewSummary,
} from "@/lib/client/job-detail";
import { CLIENT_PROJECT_BIDS_ROUTES } from "@/lib/client/project-bids";
import { jobAcceptsApplications } from "@/lib/bookings/status";
import { canClientEditJob } from "@/lib/jobs/status";
import type { JobDto } from "@/types/job";

type ClientJobOverviewProps = {
  job: JobDto;
  bidCount: number;
  bookingId: string | null;
  showEditLink?: boolean;
};

export function ClientJobOverview({
  job,
  bidCount,
  bookingId,
  showEditLink = false,
}: ClientJobOverviewProps) {
  const details = buildClientJobOverviewDetails(job);
  const summary = buildClientJobOverviewSummary(job);
  const canReviewBids =
    jobAcceptsApplications(job.status) || job.status === "assigned";
  const editable = canClientEditJob(job.status);
  const quoteLabel =
    bidCount === 1 ? "1 quote received" : `${bidCount} quotes received`;

  return (
    <div className="client-job-detail">
      <div className="client-job-detail-status-row">
        <JobStatusBadge status={job.status} />
        {job.rejectionReason ? (
          <p className="client-job-detail-rejection" role="alert">
            Rejected: {job.rejectionReason}
          </p>
        ) : null}
      </div>

      {bookingId ? (
        <div className="client-job-detail-callout client-job-detail-callout--gold">
          <p>
            Pilot assigned.{" "}
            <Link href={`/dashboard/client/bookings/${bookingId}`}>
              View booking →
            </Link>
          </p>
          <p className="client-job-detail-callout-meta">
            Need help?{" "}
            <Link href="/dashboard/client/disputes">Manage disputes →</Link>
          </p>
        </div>
      ) : canReviewBids ? (
        <div className="client-job-detail-callout">
          <p>
            {bidCount > 0
              ? `${quoteLabel}. `
              : "No quotes yet. Pilots can bid after admin approval. "}
            <Link href={CLIENT_PROJECT_BIDS_ROUTES.hub(job.id)}>
              Review project quotes →
            </Link>
          </p>
        </div>
      ) : null}

      <ClientDashboardCard
        title="Project overview"
        subtitle={summary}
        action={
          showEditLink && editable ? (
            <Link
              href={`/dashboard/client/jobs/${job.id}?edit=1`}
              className="client-job-detail-edit-link"
            >
              Edit draft
            </Link>
          ) : null
        }
      >
        <dl className="client-job-detail-grid">
          {details.map((detail) => (
            <div key={detail.label} className="client-job-detail-field">
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
          <div className="client-job-detail-field">
            <dt>Quotes received</dt>
            <dd>{bidCount}</dd>
          </div>
        </dl>
      </ClientDashboardCard>
    </div>
  );
}
