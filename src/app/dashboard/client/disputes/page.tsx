import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientDisputesList } from "@/components/dashboard/client/disputes/ClientDisputesList";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import "@/styles/client-disputes.css";

export const metadata = { title: "Disputes" };

export default async function ClientDisputesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  return (
    <DashboardPageLayout className="client-disputes-shell">
      <ClientDisputesList />
    </DashboardPageLayout>
  );
}
