import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientDisputeDetail } from "@/components/dashboard/client/disputes/ClientDisputeDetail";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { getDisputeForClient } from "@/lib/disputes/dispute";
import "@/styles/client-disputes.css";

export const metadata = { title: "Dispute details" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDisputeDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const { id } = await params;
  const result = await getDisputeForClient(id, profile.id, session.user.id);

  if (!result.ok) {
    if (result.status === 404) notFound();
    redirect("/dashboard/client/disputes");
  }

  return (
    <DashboardPageLayout className="client-disputes-shell">
      <ClientDisputeDetail dispute={result.dispute} />
    </DashboardPageLayout>
  );
}
