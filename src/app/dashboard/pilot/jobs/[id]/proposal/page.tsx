import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotSubmitProposalView } from "@/components/dashboard/pilot/proposals/PilotSubmitProposalView";
import { DashboardPageLayout } from "@/components/dashboard";
import { getOpenJobForPilot } from "@/lib/applications/application";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
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

  if (result.application) {
    redirect(`/dashboard/pilot/proposals/${result.application.id}`);
  }

  if (!result.canApply) {
    redirect(`/dashboard/pilot/jobs/${id}`);
  }

  return (
    <DashboardPageLayout className="pilot-submit-shell">
      <PilotSubmitProposalView jobId={id} initial={result} />
    </DashboardPageLayout>
  );
}
