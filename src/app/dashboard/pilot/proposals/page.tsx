import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotMyProposalsView } from "@/components/dashboard/pilot/proposals/PilotMyProposalsView";
import { DashboardPageLayout, DashboardStatusBanner } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";
import "@/styles/pilot-proposals.css";

export const metadata = { title: "My Proposals" };

type PageProps = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function PilotProposalsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const params = await searchParams;
  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  const approved = profile?.status === "approved";

  return (
    <DashboardPageLayout className="pilot-proposals-shell">
      {params.submitted === "1" ? (
        <DashboardStatusBanner>
          Proposal submitted successfully. Track status below or view the mission
          to add follow-up notes.
        </DashboardStatusBanner>
      ) : null}

      {!approved ? (
        <DashboardStatusBanner variant="muted">
          Profile status:{" "}
          <strong>
            {getProfileStatusLabel(
              (profile?.status ?? "draft") as PilotProfileStatus,
            )}
          </strong>
          . Proposals appear here after your profile is approved and you submit
          bids on marketplace missions.
        </DashboardStatusBanner>
      ) : null}

      {approved ? <PilotMyProposalsView /> : null}
    </DashboardPageLayout>
  );
}
