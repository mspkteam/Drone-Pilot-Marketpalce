import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { JobEditForm } from "@/components/client/JobEditForm";
import { ClientJobOverview } from "@/components/dashboard/client/jobs/ClientJobOverview";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { canClientEditJob } from "@/lib/jobs/status";
import { getClientJobDetail, toJobDto } from "@/lib/jobs/job";

export const metadata = { title: "Project details" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function ClientJobDetailPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const { id } = await params;
  const query = await searchParams;
  const jobRecord = await getClientJobDetail(id, profile.id);
  if (!jobRecord) {
    notFound();
  }

  const job = toJobDto(jobRecord);
  const showEditForm = query.edit === "1" && canClientEditJob(job.status);
  const bidCount = jobRecord._count.applications;
  const bookingId = jobRecord.booking?.id ?? null;

  return (
    <DashboardPageLayout className="client-job-detail-shell">
      <div className="client-job-detail-page">
        <header className="client-job-detail-header">
          <Link href="/dashboard/client/jobs" className="client-job-detail-back">
            ← Back to My Projects
          </Link>
          <h1 className="client-job-detail-title">{job.title}</h1>
          <p className="client-job-detail-subtitle">
            {showEditForm
              ? "Update your draft before submitting for approval."
              : "Review project status, requirements, and pilot quotes."}
          </p>
        </header>

        {!showEditForm ? (
          <ClientJobOverview
            job={job}
            bidCount={bidCount}
            bookingId={bookingId}
            showEditLink
          />
        ) : (
          <div className="client-job-detail-edit">
            <Link
              href={`/dashboard/client/jobs/${job.id}`}
              className="client-job-detail-back"
            >
              ← Back to overview
            </Link>
            <JobEditForm job={job} />
          </div>
        )}
      </div>
    </DashboardPageLayout>
  );
}
