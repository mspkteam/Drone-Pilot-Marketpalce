import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientFindPilots } from "@/components/dashboard/client/find-pilots/ClientFindPilots";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/client-find-pilots.css";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { listClientFindPilots } from "@/lib/client/find-pilots-server";

export const metadata = { title: "Find Pilots" };

export default async function ClientFindPilotsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const pilots = await listClientFindPilots();

  return (
    <DashboardPageLayout className="client-find-pilots-shell">
      <ClientFindPilots pilots={pilots} />
    </DashboardPageLayout>
  );
}
