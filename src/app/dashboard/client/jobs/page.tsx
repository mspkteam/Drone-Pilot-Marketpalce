import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientMyProjects } from "@/components/dashboard/client/my-projects/ClientMyProjects";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "My Projects" };

type PageProps = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function ClientJobsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const params = await searchParams;

  return (
    <DashboardPageLayout className="client-my-projects-shell">
      <ClientMyProjects submittedBanner={params.submitted === "1"} />
    </DashboardPageLayout>
  );
}
