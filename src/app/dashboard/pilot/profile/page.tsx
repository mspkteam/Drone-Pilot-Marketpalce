import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotProfileEditor } from "@/components/pilot/PilotProfileEditor";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
  toPilotProfileDto,
} from "@/lib/pilot/profile";

export const metadata = { title: "Profile" };

export default async function PilotProfilePage() {
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
        title="Profile"
        description="Manage your public pilot profile, services, and license details."
      />
      <div className="mt-8 max-w-3xl">
        <PilotProfileEditor profile={toPilotProfileDto(profile)} />
      </div>
    </>
  );
}
