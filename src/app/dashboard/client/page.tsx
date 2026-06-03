import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { getClientProfileStatusLabel } from "@/lib/client/status";
import { listJobsForClient, toJobDto } from "@/lib/jobs/job";
import { getJobStatusLabel } from "@/lib/jobs/status";
import type { ClientProfileStatus } from "@/types/client";
import type { JobStatus } from "@/types/job";

export const metadata = { title: "Client Dashboard" };

type PageProps = {
  searchParams: Promise<{ onboarding?: string }>;
};

export default async function ClientDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const params = await searchParams;
  const profile = await getClientProfileByUserId(session.user.id);

  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const status = (profile?.status ?? "draft") as ClientProfileStatus;
  const justCompleted = params.onboarding === "complete";
  const allJobs = await listJobsForClient(profile!.id);
  const recentJobs = allJobs.slice(0, 3).map(toJobDto);

  return (
    <>
      <PageHeader
        badge="Client"
        title={`Welcome${profile?.contactName ? `, ${profile.contactName}` : ""}`}
        description="Overview of your jobs, offers, and active bookings."
      />

      <div className="mt-8 space-y-6">
        {justCompleted ? (
          <p
            className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark"
            role="status"
          >
            Your client profile is set up. You can post your first job when job
            posting launches (M06).
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="premium-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Account status
            </p>
            <p className="mt-2 text-lg font-semibold">
              {getClientProfileStatusLabel(status)}
            </p>
            {profile?.companyName ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.companyName}
              </p>
            ) : null}
            <Button
              href="/dashboard/client/profile"
              variant="ghost"
              size="sm"
              className="mt-3"
            >
              Edit profile
            </Button>
          </div>
          <div className="premium-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contact
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile?.phone || "No phone on file"}
            </p>
          </div>
        </div>

        <div className="premium-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Jobs
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Post drone missions and track approval status.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href="/dashboard/client/jobs/new" size="sm">
                Post job
              </Button>
              <Button href="/dashboard/client/jobs" variant="outline" size="sm">
                My jobs
              </Button>
              <Button href="/dashboard/client/bookings" variant="outline" size="sm">
                Bookings
              </Button>
              <Button href="/dashboard/client/reviews" variant="outline" size="sm">
                Reviews
              </Button>
              <Button href="/dashboard/client/payments" variant="outline" size="sm">
                Payments
              </Button>
            </div>
          </div>
          {recentJobs.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {recentJobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/dashboard/client/jobs/${job.id}`}
                    className="flex items-center justify-between text-sm hover:text-gold-dark"
                  >
                    <span className="font-medium">{job.title}</span>
                    <span className="text-muted-foreground">
                      {getJobStatusLabel(job.status as JobStatus)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No jobs yet — post your first mission.
            </p>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/dashboard/client/profile"
            className="text-gold-dark hover:text-gold"
          >
            View full profile →
          </Link>
        </p>
      </div>
    </>
  );
}
