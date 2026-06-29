import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotSubscriptionView } from "@/components/dashboard/pilot/subscription/PilotSubscriptionView";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-subscription.css";

export const metadata = { title: "Membership" };

export default async function PilotSubscriptionPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="pilot-subscription-shell">
      <PilotSubscriptionView />
    </DashboardPageLayout>
  );
}
