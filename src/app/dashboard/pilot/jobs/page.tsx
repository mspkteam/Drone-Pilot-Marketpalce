import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotMissionMarketplace } from "@/components/dashboard/pilot/marketplace/PilotMissionMarketplace";
import { DashboardPageLayout, DashboardStatusBanner } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";
import "@/styles/pilot-marketplace.css";

export const metadata = { title: "Mission Marketplace" };

export default async function PilotJobsPage() {
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
    <DashboardPageLayout className="pilot-marketplace-shell">
      {!approved ? (
        <DashboardStatusBanner variant="muted">
          Profile status:{" "}
          <strong>
            {getProfileStatusLabel(
              (profile?.status ?? "draft") as PilotProfileStatus,
            )}
          </strong>
          . You can browse and bid once an admin approves your pilot profile.
        </DashboardStatusBanner>
      ) : null}

      {approved ? <PilotMissionMarketplace /> : null}
    </DashboardPageLayout>
  );
}
