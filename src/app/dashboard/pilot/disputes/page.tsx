import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientDisputesList } from "@/components/dashboard/client/disputes/ClientDisputesList";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/client-disputes.css";

export const metadata = { title: "Disputes" };

export default async function PilotDisputesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="client-disputes-shell">
      <ClientDisputesList
        apiPath="/api/pilot/disputes"
        detailBase="/dashboard/pilot/disputes"
        bookingsHref="/dashboard/pilot/contracts"
        counterpartLabel="Client"
      />
    </DashboardPageLayout>
  );
}
