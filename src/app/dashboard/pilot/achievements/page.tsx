import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotWingsPanel } from "@/components/wings/PilotWingsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

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
    <>
      <PageHeader
        title="Digital Wings"
        description="Milestone badges earned on the marketplace."
      />
      <div className="mt-8 max-w-3xl">
        <PilotWingsPanel />
      </div>
    </>
  );
}
