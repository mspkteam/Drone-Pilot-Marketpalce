import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotProposalDetailView } from "@/components/dashboard/pilot/proposals/PilotProposalDetailView";
import { DashboardPageLayout } from "@/components/dashboard";
import { getApplicationForPilot } from "@/lib/applications/application";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-submit-proposal.css";

export const metadata = { title: "Proposal details" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PilotProposalDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  if (profile.status !== "approved") {
    redirect("/dashboard/pilot/proposals");
  }

  const { id } = await params;
  const application = await getApplicationForPilot(id, profile.id);
  if (!application) {
    notFound();
  }

  return (
    <DashboardPageLayout className="pilot-submit-shell">
      <PilotProposalDetailView initial={application} />
    </DashboardPageLayout>
  );
}
