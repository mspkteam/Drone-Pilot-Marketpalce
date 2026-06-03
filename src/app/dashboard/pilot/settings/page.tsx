import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettingsPanel } from "@/components/settings/AccountSettingsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

export const metadata = { title: "Settings" };

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
    <>
      <PageHeader
        title="Settings"
        description="Account, password, public profile visibility, and notifications."
      />
      <div className="mt-8">
        <AccountSettingsPanel
          role="pilot"
          profileHref="/dashboard/pilot/profile"
        />
      </div>
    </>
  );
}
