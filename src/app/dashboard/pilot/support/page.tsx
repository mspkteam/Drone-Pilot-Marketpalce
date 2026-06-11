import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotSupportHelpCenter } from "@/components/dashboard/pilot/support/PilotSupportHelpCenter";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-support.css";

export const metadata = { title: "Support & Help Center" };

export default async function PilotSupportPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="pilot-support-shell">
      <PilotSupportHelpCenter />
    </DashboardPageLayout>
  );
}
