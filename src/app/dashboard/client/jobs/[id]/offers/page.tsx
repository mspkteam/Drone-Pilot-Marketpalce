import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientJobOffers } from "@/components/client/ClientJobOffers";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { getJobForClient, toJobDto } from "@/lib/jobs/job";
import { jobAcceptsApplications } from "@/lib/bookings/status";
import type { JobStatus } from "@/types/job";

export const metadata = { title: "Job offers" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientJobOffersPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const { id } = await params;
  const job = await getJobForClient(id, profile.id);
  if (!job) {
    notFound();
  }

  const jobDto = toJobDto(job);
  const canReviewOffers =
    jobAcceptsApplications(job.status) || job.status === "assigned";

  return (
    <>
      <PageHeader
        title="Pilot offers"
        description={`Review bids for “${job.title}”.`}
      >
        <Link
          href={`/dashboard/client/jobs/${job.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to job
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <JobStatusBadge status={jobDto.status as JobStatus} />
        </div>

        {!canReviewOffers ? (
          <p className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-muted-foreground">
            Offers are available after admin approval while the job is open for
            bids.
          </p>
        ) : (
          <ClientJobOffers jobId={job.id} />
        )}
      </div>
    </>
  );
}
