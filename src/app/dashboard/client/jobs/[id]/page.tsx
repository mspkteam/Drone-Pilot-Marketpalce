import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { JobEditForm } from "@/components/client/JobEditForm";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { getBookingByJobId } from "@/lib/bookings/booking";
import { jobAcceptsApplications } from "@/lib/bookings/status";
import { getJobForClient, toJobDto } from "@/lib/jobs/job";

export const metadata = { title: "Job details" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientJobDetailPage({ params }: PageProps) {
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

  const booking = await getBookingByJobId(job.id);
  const showOffersLink =
    jobAcceptsApplications(job.status) || job.status === "assigned";

  return (
    <>
      <PageHeader title={job.title} description="View or edit your job posting.">
        <Link
          href="/dashboard/client/jobs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to jobs
        </Link>
      </PageHeader>
      <div className="mt-8 max-w-3xl space-y-4">
        {booking ? (
          <p className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark">
            Pilot assigned.{" "}
            <Link
              href={`/dashboard/client/bookings/${booking.id}`}
              className="font-medium underline"
            >
              View booking →
            </Link>
          </p>
        ) : showOffersLink ? (
          <p className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm">
            <Link
              href={`/dashboard/client/jobs/${job.id}/offers`}
              className="font-medium text-gold-dark hover:text-gold"
            >
              Review pilot offers →
            </Link>
          </p>
        ) : null}
        <JobEditForm job={toJobDto(job)} />
      </div>
    </>
  );
}
