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

export const metadata = { title: "Client Dashboard" };

type PageProps = {
  searchParams: Promise<{ onboarding?: string }>;
};

/** Screenshot/mock phase — display John until M38 wires live client greeting. */
function clientDisplayName(): string {
  return "John";
}

export default async function ClientDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const params = await searchParams;
  const profile = await getClientProfileByUserId(session.user.id);

  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const justCompleted = params.onboarding === "complete";
  const clientName = clientDisplayName();

  return (
    <DashboardPageLayout className="client-dashboard-shell">
      {justCompleted ? (
        <DashboardStatusBanner>
          Your client profile is set up. Post your first project and receive
          quotes from verified pilots.
        </DashboardStatusBanner>
      ) : null}

      <ClientDashboardOverview clientName={clientName} />
    </DashboardPageLayout>
  );
}
