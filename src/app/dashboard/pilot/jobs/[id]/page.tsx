import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { DashboardPageLayout } from "@/components/dashboard";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import { getOpenJobForPilot } from "@/lib/applications/application";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { JOB_CATEGORIES } from "@/types/job";
import type { ApplicationStatus } from "@/types/application";
import "@/styles/pilot-submit-proposal.css";

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
    <DashboardPageLayout className="pilot-submit-shell">
      <div className="pilot-submit-page">
        <header className="pilot-submit-header">
          <div className="pilot-submit-header-nav">
            <Link href="/dashboard/pilot/jobs" className="pilot-submit-back">
              ← Back to marketplace
            </Link>
          </div>
          <p className="pilot-submit-eyebrow">PILOT / MARKETPLACE</p>
          <h1 className="pilot-submit-title">{job.title}</h1>
          <p className="pilot-submit-desc">{job.locationLabel}</p>
          <div className="pilot-submit-job-meta" style={{ marginTop: "1rem" }}>
            <div>
              <dt style={{ margin: 0, fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-soft)" }}>Category</dt>
              <dd style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>{categoryLabel(job.category)}</dd>
            </div>
            {budget ? (
              <div>
                <dt style={{ margin: 0, fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-soft)" }}>Budget</dt>
                <dd style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>{budget}</dd>
              </div>
            ) : null}
          </div>
        </header>

        <div className="pilot-submit-main">
          <section className="pilot-submit-job-card">
            <div className="pilot-submit-job-copy">
              <div>
                <h3>Description</h3>
                <p>{job.description}</p>
              </div>
              {job.requirements ? (
                <div>
                  <h3>Requirements</h3>
                  <p>{job.requirements}</p>
                </div>
              ) : null}
            </div>
          </section>

          {application ? (
            <section className="pilot-submit-job-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
                <h2 className="pilot-submit-form-title" style={{ margin: 0 }}>Your proposal</h2>
                <ApplicationStatusBadge status={application.status as ApplicationStatus} />
              </div>
              <p style={{ margin: "1rem 0 0", fontSize: "0.875rem" }}>
                Proposed: {application.currency}{" "}
                {application.proposedAmount.toLocaleString()}
              </p>
              {application.message ? (
                <p style={{ margin: "0.75rem 0 0", whiteSpace: "pre-wrap", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  {application.message}
                </p>
              ) : null}
              <Link href={`/dashboard/pilot/proposals/${application.id}`} className="pilot-submit-side-link" style={{ display: "inline-block", marginTop: "1rem" }}>
                View proposal details →
              </Link>
            </section>
          ) : canApply ? (
            <section className="pilot-submit-job-card">
              <h2 className="pilot-submit-form-title">Ready to bid?</h2>
              <p className="pilot-submit-desc">
                Open the full proposal form to submit your offer, deliverables, and availability.
              </p>
              <Link href={`/dashboard/pilot/jobs/${job.id}/proposal`} className="pilot-submit-btn-primary" style={{ display: "inline-block", marginTop: "1rem", textDecoration: "none" }}>
                Submit Proposal →
              </Link>
            </section>
          ) : (
            <section className="pilot-submit-job-card">
              <h2 className="pilot-submit-form-title">Bidding not available</h2>
              <p className="pilot-submit-desc">
                {applyBlockedMessage ??
                  "Your membership tier does not allow bidding on this job."}
              </p>
              <Link href="/dashboard/pilot/subscription" className="pilot-submit-side-link" style={{ display: "inline-block", marginTop: "1rem" }}>
                View membership tiers →
              </Link>
            </section>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
