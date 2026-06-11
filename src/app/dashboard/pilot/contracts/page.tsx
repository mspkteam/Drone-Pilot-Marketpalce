import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotActiveContracts } from "@/components/dashboard/pilot/active-contracts/PilotActiveContracts";
import { DashboardPageLayout, DashboardStatusBanner } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";

export const metadata = { title: "Active Contracts" };

export default async function PilotContractsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  const approved = profile?.status === "approved";

  return (
    <DashboardPageLayout className="client-my-projects-shell">
      {!approved ? (
        <DashboardStatusBanner variant="muted">
          Profile status:{" "}
          <strong>
            {getProfileStatusLabel(
              (profile?.status ?? "draft") as PilotProfileStatus,
            )}
          </strong>
          . Active contracts appear here after a client accepts your proposal.
        </DashboardStatusBanner>
      ) : null}

      {approved ? <PilotActiveContracts /> : null}
    </DashboardPageLayout>
  );
}
