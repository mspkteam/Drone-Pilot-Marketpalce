import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientDashboardOverview } from "@/components/dashboard/client/ClientDashboardOverview";
import {
  DashboardPageLayout,
  DashboardStatusBanner,
} from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { getClientDashboardOverviewData } from "@/lib/client/dashboard-overview-server";

export const metadata = { title: "Client Dashboard" };

type PageProps = {
  searchParams: Promise<{ onboarding?: string }>;
};

export default async function ClientDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const params = await searchParams;
  const profile = await getClientProfileByUserId(session.user.id);

  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const overview = await getClientDashboardOverviewData(profile.id, session.user.id);
  const justCompleted = params.onboarding === "complete";

  return (
    <DashboardPageLayout className="client-dashboard-shell">
      {justCompleted ? (
        <DashboardStatusBanner>
          Your client profile is set up. Post your first project and receive
          quotes from verified pilots.
        </DashboardStatusBanner>
      ) : null}

      <ClientDashboardOverview {...overview} />
    </DashboardPageLayout>
  );
}
