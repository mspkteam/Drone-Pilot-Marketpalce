import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotProfileCompletionView } from "@/components/dashboard/pilot/profile/PilotProfileCompletionView";
import { DashboardPageLayout } from "@/components/dashboard";
import { listCertificatesForPilot } from "@/lib/certificates/certificate";
import {
  getPilotProfileByUserId,
  toPilotProfileDto,
} from "@/lib/pilot/profile";
import { approvedProfileCredentials } from "@/lib/pilot/verification-documents-catalog";
import {
  getApprovedVerificationTypes,
  listVerificationsForPilot,
} from "@/lib/verification/verification";
import { listPublicPilotWings } from "@/lib/wings/wings";
import { pickHighestPublicWing } from "@/lib/wings/pick-highest";
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
  let approvedCredentials: Array<{ catalogId: string; title: string }> = [];
  let certificates: Array<{
    id: string;
    certificateNumber: string;
    templateName: string;
    issuedAt: string;
  }> = [];
  let highestWing: { title: string; imageUrl: string | null } | null = null;

  if (profile) {
    const [types, verifications, certRows, wings] = await Promise.all([
      getApprovedVerificationTypes(profile.id),
      listVerificationsForPilot(profile.id),
      listCertificatesForPilot(profile.id),
      listPublicPilotWings(profile.id),
    ]);
    insuranceVerified = types.includes("insurance");
    approvedCredentials = approvedProfileCredentials(verifications);
    certificates = certRows.map((c) => ({
      id: c.id,
      certificateNumber: c.certificateNumber,
      templateName: c.templateName,
      issuedAt: c.issuedAt,
    }));
    const top = pickHighestPublicWing(wings);
    highestWing = top
      ? { title: top.title, imageUrl: top.imageUrl }
      : null;
  }

  return (
    <DashboardPageLayout className="profile-onboarding-shell pilot-profile-shell">
      <PilotProfileCompletionView
        profile={profileDto}
        insuranceVerified={insuranceVerified}
        approvedCredentials={approvedCredentials}
        certificates={certificates}
        highestWing={highestWing}
      />
    </DashboardPageLayout>
  );
}
