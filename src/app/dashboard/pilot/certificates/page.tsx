import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotCertificatesPanel } from "@/components/pilot/PilotCertificatesPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

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
    <>
      <PageHeader
        title="Certificates"
        description="Download platform certificates issued by admins after review."
      />
      <div className="mt-8 max-w-3xl">
        <PilotCertificatesPanel />
      </div>
    </>
  );
}
