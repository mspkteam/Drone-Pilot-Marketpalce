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
import {
  getClientDashboardOverviewData,
  getEmptyClientDashboardOverviewData,
} from "@/lib/client/dashboard-overview-server";

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
  const onboardingComplete = Boolean(profile && isOnboardingComplete(profile));
  const justCompleted = params.onboarding === "complete";

  const overview = profile
    ? await getClientDashboardOverviewData(profile.id, session.user.id)
    : await getEmptyClientDashboardOverviewData(
        session.user.id,
        session.user.email,
      );

  return (
    <DashboardPageLayout className="client-dashboard-shell">
      {!onboardingComplete ? (
        <DashboardStatusBanner>
          Complete your client profile to unlock posting projects, Find a Pilot,
          messages, and the rest of your dashboard. Open{" "}
          <a
            href="/dashboard/client/profile"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Profile
          </a>{" "}
          to continue — this message stays until setup is finished.
        </DashboardStatusBanner>
      ) : justCompleted ? (
        <DashboardStatusBanner>
          Your client profile is set up. Post your first project and receive
          quotes from verified pilots.
        </DashboardStatusBanner>
      ) : null}

      <ClientDashboardOverview {...overview} />
    </DashboardPageLayout>
  );
}
