import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotSubmitProposalView } from "@/components/dashboard/pilot/proposals/PilotSubmitProposalView";
import { DashboardPageLayout, DashboardStatusBanner } from "@/components/dashboard";
import { getOpenJobForPilot } from "@/lib/applications/application";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import "@/styles/pilot-submit-proposal.css";

export const metadata = { title: "Submit Proposal" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PilotSubmitProposalPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/dashboard/pilot/profile");
  }

  const { id } = await params;

  if (profile.status !== "approved") {
    return (
      <DashboardPageLayout className="pilot-submit-shell">
        <DashboardStatusBanner variant="muted">
          Your pilot profile must be approved by an admin before you can submit
          proposals. Current status: <strong>{profile.status}</strong>.
        </DashboardStatusBanner>
        <p>
          <Link href={`/dashboard/pilot/jobs/${id}`}>← Back to job</Link>
        </p>
      </DashboardPageLayout>
    );
  }

  const result = await getOpenJobForPilot(id, profile.id);
  if (!result) {
    notFound();
  }

  if (result.application && result.application.status !== "draft") {
    redirect(`/dashboard/pilot/proposals/${result.application.id}`);
  }

  if (!result.canApply) {
    return (
      <DashboardPageLayout className="pilot-submit-shell">
        <DashboardStatusBanner variant="muted">
          {result.applyBlockedMessage ??
            "You cannot submit a proposal for this job right now."}
        </DashboardStatusBanner>
        <p>
          <Link href={`/dashboard/pilot/jobs/${id}`}>← Back to job</Link>
        </p>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout className="pilot-submit-shell">
      <PilotSubmitProposalView jobId={id} initial={result} />
    </DashboardPageLayout>
  );
}
