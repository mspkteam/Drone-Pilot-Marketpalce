import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotAchievementsView } from "@/components/dashboard/pilot/achievements/PilotAchievementsView";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-achievements.css";

export const metadata = { title: "Digital Wings" };

export default async function PilotAchievementsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="pilot-achievements-shell">
      <PilotAchievementsView />
    </DashboardPageLayout>
  );
}
