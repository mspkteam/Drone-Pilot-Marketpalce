import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotAccountSettings } from "@/components/dashboard/pilot/settings/PilotAccountSettings";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-settings.css";

export const metadata = { title: "Pilot Settings" };

export default async function PilotSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="pilot-settings-shell">
      <PilotAccountSettings />
    </DashboardPageLayout>
  );
}
