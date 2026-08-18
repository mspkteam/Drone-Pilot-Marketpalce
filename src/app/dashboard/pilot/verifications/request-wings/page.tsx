import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotRequestWingsView } from "@/components/dashboard/pilot/verifications/PilotRequestWingsView";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-verifications.css";
import "@/styles/pilot-request-wings.css";

export const metadata = { title: "Request Wings" };

export default async function PilotRequestWingsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="pilot-request-wings-shell">
      <PilotRequestWingsView />
    </DashboardPageLayout>
  );
}
