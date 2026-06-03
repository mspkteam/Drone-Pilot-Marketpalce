import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotOnboardingForm } from "@/components/pilot/PilotOnboardingForm";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

export const metadata = { title: "Pilot onboarding" };

export default async function PilotOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot");
  }

  return (
    <>
      <PageHeader
        badge="Onboarding"
        title="Complete your pilot profile"
        description="Tell clients who you are, where you operate, and confirm compliance before bidding on jobs."
      />
      <div className="mt-8 max-w-3xl">
        <PilotOnboardingForm />
      </div>
    </>
  );
}
