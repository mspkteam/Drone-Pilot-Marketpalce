import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotLockedJobsView } from "@/components/dashboard/pilot/locked-jobs/PilotLockedJobsView";
import { DashboardPageLayout, DashboardStatusBanner } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";
import "@/styles/pilot-locked-jobs.css";

export const metadata = { title: "Locked Jobs" };

export default async function PilotLockedJobsPage() {
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
    <DashboardPageLayout className="pilot-locked-jobs-shell">
      {!approved ? (
        <DashboardStatusBanner variant="muted">
          Profile status:{" "}
          <strong>
            {getProfileStatusLabel(
              (profile?.status ?? "draft") as PilotProfileStatus,
            )}
          </strong>
          . Locked missions appear after admin approval and membership enrollment.
        </DashboardStatusBanner>
      ) : null}

      {approved ? <PilotLockedJobsView /> : null}
    </DashboardPageLayout>
  );
}
