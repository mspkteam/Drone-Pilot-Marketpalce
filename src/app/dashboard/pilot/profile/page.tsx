import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotProfileCompletionView } from "@/components/dashboard/pilot/profile/PilotProfileCompletionView";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  toPilotProfileDto,
} from "@/lib/pilot/profile";
import { getApprovedVerificationTypes } from "@/lib/verification/verification";
import "@/styles/profile-onboarding.css";

export const metadata = { title: "Profile" };

export default async function PilotProfilePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  const profileDto = profile ? toPilotProfileDto(profile) : null;

  let insuranceVerified = false;
  if (profile) {
    const types = await getApprovedVerificationTypes(profile.id);
    insuranceVerified = types.includes("insurance");
  }

  return (
    <DashboardPageLayout className="profile-onboarding-shell pilot-profile-shell">
      <PilotProfileCompletionView
        profile={profileDto}
        insuranceVerified={insuranceVerified}
      />
    </DashboardPageLayout>
  );
}
