import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { PilotSubscriptionManager } from "@/components/pilot/PilotSubscriptionManager";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

export const metadata = { title: "Subscription" };

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
    <>
      <PageHeader
        title="Subscription"
        description="View and manage your pilot marketplace plan."
      />
      <div className="mt-8 max-w-3xl">
        <PilotSubscriptionManager />
      </div>
    </>
  );
}
