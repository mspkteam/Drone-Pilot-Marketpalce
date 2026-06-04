import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  DashboardDetailRow,
  DashboardHero,
  DashboardModuleCard,
  DashboardModulesGrid,
  DashboardPageLayout,
  DashboardStatsGrid,
  DashboardStatusBanner,
  IconJobs,
  IconProfile,
  IconServices,
  StatCard,
} from "@/components/dashboard";
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
    <DashboardPageLayout>
      <DashboardHero
        eyebrow="Client dashboard"
        title={`Welcome${profile?.contactName ? `, ${profile.contactName}` : ""}`}
        description="Overview of your jobs, offers, bookings, and payments."
        aside={
          profile?.companyName ? (
            <div className="rounded-xl border border-gold/30 bg-gold/5 px-5 py-4 text-center lg:text-right">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Company
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {profile.companyName}
              </p>
            </div>
          ) : null
        }
      />

      {justCompleted ? (
        <DashboardStatusBanner>
          Your client profile is set up. Post your first job and track approval
          from the jobs module below.
        </DashboardStatusBanner>
      ) : null}

      <DashboardStatsGrid>
        <StatCard
          label="Account status"
          value={getClientProfileStatusLabel(status)}
          icon={<IconProfile className="h-5 w-5" />}
          href="/dashboard/client/profile"
        />
        <StatCard
          label="Contact phone"
          value={profile?.phone || "—"}
          icon={<IconServices className="h-5 w-5" />}
          helperText={profile?.phone ? "On file" : "Not set"}
        />
      </DashboardStatsGrid>

      <DashboardModuleCard
        title="Jobs & missions"
        icon={<IconJobs className="h-5 w-5" />}
        action={
          <div className="flex flex-wrap gap-2">
            <Button href="/dashboard/client/jobs/new" size="sm">
              Post job
            </Button>
            <Button href="/dashboard/client/jobs" variant="outline" size="sm">
              My jobs
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Post drone missions and track approval status.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
        {recentJobs.length > 0 ? (
          <dl className="mt-6 rounded-lg border border-border bg-surface/50 px-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="border-b border-border/60 py-3 last:border-0">
                <Link
                  href={`/dashboard/client/jobs/${job.id}`}
                  className="flex items-center justify-between gap-4 hover:text-gold-light"
                >
                  <span className="text-sm font-medium text-foreground">
                    {job.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getJobStatusLabel(job.status as JobStatus)}
                  </span>
                </Link>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-6 rounded-lg border border-dashed border-border bg-surface/40 px-4 py-8 text-center text-sm text-muted-foreground">
            No jobs yet — post your first mission.
          </p>
        )}
      </DashboardModuleCard>

      <DashboardModulesGrid>
        <DashboardModuleCard
          title="Account details"
          icon={<IconProfile className="h-5 w-5" />}
        >
          <dl className="rounded-lg border border-border bg-surface/50 px-4">
            <DashboardDetailRow
              label="Status"
              value={getClientProfileStatusLabel(status)}
            />
            <DashboardDetailRow
              label="Company"
              value={profile?.companyName || "—"}
            />
            <DashboardDetailRow
              label="Phone"
              value={profile?.phone || "—"}
            />
          </dl>
          <Button
            href="/dashboard/client/profile"
            variant="ghost"
            size="sm"
            className="mt-4"
          >
            Edit profile
          </Button>
        </DashboardModuleCard>
        <DashboardModuleCard
          title="Quick actions"
          icon={<IconJobs className="h-5 w-5" />}
        >
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/dashboard/client/messages"
                className="font-medium text-gold-light hover:text-gold"
              >
                Messages →
              </Link>
            </li>
            <li>
              <Link
                href="/pilots"
                className="font-medium text-gold-light hover:text-gold"
              >
                Browse pilots →
              </Link>
            </li>
          </ul>
        </DashboardModuleCard>
      </DashboardModulesGrid>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/dashboard/client/profile"
          className="font-medium text-gold-light hover:text-gold"
        >
          View full profile →
        </Link>
      </p>
    </DashboardPageLayout>
  );
}
