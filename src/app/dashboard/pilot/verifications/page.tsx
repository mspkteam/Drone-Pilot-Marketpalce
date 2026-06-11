import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotVerificationDocumentsView } from "@/components/dashboard/pilot/verifications/PilotVerificationDocumentsView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/pilot-verifications.css";

export const metadata = { title: "Identity & License Verification" };

export default async function PilotVerificationsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="pilot-verification-shell">
      <PilotVerificationDocumentsView />
    </DashboardPageLayout>
  );
}
