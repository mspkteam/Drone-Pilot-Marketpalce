import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientMyProjects } from "@/components/dashboard/client/my-projects/ClientMyProjects";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { listClientMyProjects } from "@/lib/client/my-projects-server";

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
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const params = await searchParams;
  const projects = await listClientMyProjects(profile.id);

  return (
    <DashboardPageLayout className="client-my-projects-shell">
      <ClientMyProjects
        projects={projects}
        submittedBanner={params.submitted === "1"}
      />
    </DashboardPageLayout>
  );
}
