import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientProjectBids } from "@/components/dashboard/client/project-bids/ClientProjectBids";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { getClientProjectBidsPageData } from "@/lib/client/project-bids-server";

export const metadata = { title: "Project Bids" };

type PageProps = {
  searchParams: Promise<{ jobId?: string }>;
};

export default async function ClientProjectBidsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const params = await searchParams;
  const pageData = await getClientProjectBidsPageData(
    profile.id,
    params.jobId ?? null,
  );

  return (
    <DashboardPageLayout className="client-project-bids-shell">
      <ClientProjectBids
        jobOptions={pageData.jobOptions}
        selectedJobId={pageData.selectedJobId}
        summary={pageData.summary}
        initialBids={pageData.bids}
        hasBooking={pageData.hasBooking}
        bookingId={pageData.bookingId}
      />
    </DashboardPageLayout>
  );
}
