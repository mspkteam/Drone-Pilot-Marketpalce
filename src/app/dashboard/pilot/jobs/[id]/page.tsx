import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";
import { PilotBidForm, PilotJobSummary } from "@/components/pilot/PilotBidForm";
import { Button } from "@/components/ui/Button";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import { getOpenJobForPilot } from "@/lib/applications/application";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { JOB_CATEGORIES } from "@/types/job";
import type { ApplicationStatus } from "@/types/application";

export const metadata = { title: "Job details" };

type PageProps = {
  params: Promise<{ id: string }>;
};

function categoryLabel(id: string) {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export default async function PilotJobDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  if (profile.status !== "approved") {
    redirect("/dashboard/pilot/jobs");
  }

  const { id } = await params;
  const result = await getOpenJobForPilot(id, profile.id);
  if (!result) {
    notFound();
  }

  const { job, application, canApply, applyBlockedMessage } = result;
  const budget = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);

  return (
    <>
      <PageHeader title={job.title} description={job.locationLabel}>
        <Link
          href="/dashboard/pilot/jobs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to jobs
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl space-y-8">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{categoryLabel(job.category)}</span>
          {budget ? <span>· {budget}</span> : null}
          {job.scheduledDate ? (
            <span>
              · Scheduled {new Date(job.scheduledDate).toLocaleDateString()}
            </span>
          ) : null}
        </div>

        <PilotJobSummary job={job} />

        {application ? (
          <div className="space-y-3 rounded-lg border border-gold/30 bg-gold/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="font-medium text-gold-dark">Your application</p>
              <ApplicationStatusBadge
                status={application.status as ApplicationStatus}
              />
            </div>
            <p className="text-sm">
              Proposed: {application.currency}{" "}
              {application.proposedAmount.toLocaleString()}
            </p>
            {application.message ? (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {application.message}
              </p>
            ) : null}
            {application.estimatedDeliveryDate ? (
              <p className="text-sm text-muted-foreground">
                Estimated delivery:{" "}
                {new Date(application.estimatedDeliveryDate).toLocaleDateString()}
              </p>
            ) : null}
          </div>
        ) : canApply ? (
          <div className="rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold">Submit your bid</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              One application per job. The client will review offers in a later
              release.
            </p>
            <div className="mt-6">
              <PilotBidForm jobId={job.id} currency={job.currency} />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gold/30 bg-gold/10 p-6">
            <h2 className="text-lg font-semibold text-gold-dark">
              Bidding not available
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {applyBlockedMessage ??
                "Your membership tier does not allow bidding on this job."}
            </p>
            <Button
              href="/dashboard/pilot/subscription"
              variant="outline"
              size="sm"
              className="mt-4"
            >
              View membership tiers
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
