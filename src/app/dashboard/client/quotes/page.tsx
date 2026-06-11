import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientProjectBids } from "@/components/dashboard/client/project-bids/ClientProjectBids";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "Project Bids" };

export default async function ClientProjectBidsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  return (
    <DashboardPageLayout className="client-project-bids-shell">
      <ClientProjectBids />
    </DashboardPageLayout>
  );
}
