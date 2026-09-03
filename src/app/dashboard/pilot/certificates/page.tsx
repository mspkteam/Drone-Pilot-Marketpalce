import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotCertificatesView } from "@/components/dashboard/pilot/certificates/PilotCertificatesView";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-certificates.css";

export const metadata = { title: "Certificates" };

export default async function PilotCertificatesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="pilot-certificates-shell">
      <PilotCertificatesView />
    </DashboardPageLayout>
  );
}
