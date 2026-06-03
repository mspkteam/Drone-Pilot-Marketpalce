"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { JOB_CATEGORIES } from "@/types/job";
import type { AdminJobDto } from "@/types/admin-job";
import { canApproveJob, canRejectJob } from "@/lib/jobs/status";

function categoryLabel(id: string) {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

type AdminJobReviewProps = {
  job: AdminJobDto;
};

export function AdminJobReview({ job }: AdminJobReviewProps) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await fetch(`/api/admin/jobs/${job.id}/approve`, {
      method: "POST",
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to approve job.");
      return;
    }
    setSuccess("Job approved and is now open for pilots.");
    router.refresh();
  }

  async function handleReject() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await fetch(`/api/admin/jobs/${job.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to reject job.");
      return;
    }
    setSuccess("Job rejected. Client can edit and resubmit.");
    router.refresh();
  }

  const showActions =
    canApproveJob(job.status) && canRejectJob(job.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <JobStatusBadge status={job.status} />
        <Link
          href="/dashboard/admin/jobs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to queue
        </Link>
      </div>

      {error ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold-dark"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <section className="rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-lg font-semibold">{job.title}</h2>
        <p className="text-sm whitespace-pre-wrap">{job.description}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Category</dt>
            <dd className="font-medium">{categoryLabel(job.category)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Location</dt>
            <dd className="font-medium">{job.locationLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Client</dt>
            <dd className="font-medium">
              {job.client.contactName}
              {job.client.companyName ? ` (${job.client.companyName})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Client email</dt>
            <dd className="font-medium">{job.client.email ?? "—"}</dd>
          </div>
          {(job.budgetMin != null || job.budgetMax != null) && (
            <div>
              <dt className="text-muted-foreground">Budget</dt>
              <dd className="font-medium">
                {job.budgetMin != null ? `$${job.budgetMin}` : "—"}
                {job.budgetMax != null ? ` – $${job.budgetMax}` : ""}{" "}
                {job.currency}
              </dd>
            </div>
          )}
          {job.scheduledDate ? (
            <div>
              <dt className="text-muted-foreground">Preferred date</dt>
              <dd className="font-medium">
                {new Date(job.scheduledDate).toLocaleDateString()}
              </dd>
            </div>
          ) : null}
        </dl>
        {job.requirements ? (
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Requirements
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        ) : null}
        {job.rejectionReason ? (
          <p className="text-sm text-destructive">
            Previous rejection: {job.rejectionReason}
          </p>
        ) : null}
      </section>

      {showActions ? (
        <section className="space-y-4 rounded-lg border border-gold/30 bg-gold/5 p-6">
          <h3 className="font-semibold">Moderation</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              disabled={loading}
              onClick={() => void handleApprove()}
            >
              {loading ? "Processing…" : "Approve job"}
            </Button>
          </div>
          <FormField
            label="Rejection reason"
            htmlFor="rejectReason"
            hint="Required if rejecting — client will see this message."
          >
            <textarea
              id="rejectReason"
              rows={3}
              className={inputClassName}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={loading}
            />
          </FormField>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => void handleReject()}
          >
            Reject job
          </Button>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          This job has already been moderated. Approved jobs are visible to
          pilots with status <strong>open</strong> (M08 bidding).
        </p>
      )}
    </div>
  );
}
