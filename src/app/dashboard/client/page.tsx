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
  const onboardingComplete = Boolean(profile && isOnboardingComplete(profile));
  const justCompleted = params.onboarding === "complete";

  if (!profile || !onboardingComplete) {
    return (
      <DashboardPageLayout className="client-dashboard-shell">
        <DashboardStatusBanner>
          Complete your client profile to unlock posting projects, Find a Pilot,
          messages, and the rest of your dashboard. Your navigation stays visible
          while you finish setup.
        </DashboardStatusBanner>
        <p className="text-sm text-[var(--color-text-soft)]">
          Open{" "}
          <a
            href="/dashboard/client/profile"
            className="font-semibold text-[var(--color-gold)] underline-offset-2 hover:underline"
          >
            Profile
          </a>{" "}
          to continue. This message stays until your profile is complete.
        </p>
      </DashboardPageLayout>
    );
  }

  const overview = await getClientDashboardOverviewData(profile.id, session.user.id);

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
