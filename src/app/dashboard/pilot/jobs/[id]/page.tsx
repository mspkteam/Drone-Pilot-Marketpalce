import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotJobDetailView } from "@/components/dashboard/pilot/marketplace/PilotJobDetailView";
import { DashboardPageLayout } from "@/components/dashboard";
import { getOpenJobForPilot } from "@/lib/applications/application";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-marketplace.css";
import "@/styles/pilot-proposals.css";

export const metadata = { title: "Job details" };

type PageProps = {
  params: Promise<{ id: string }>;
};

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

  return (
    <DashboardPageLayout className="pilot-marketplace-shell">
      <PilotJobDetailView detail={result} />
    </DashboardPageLayout>
  );
}
