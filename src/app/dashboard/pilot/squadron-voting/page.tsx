import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPageLayout } from "@/components/dashboard";
import { PilotSquadronVotingPortal } from "@/components/dashboard/pilot/squadron-voting/PilotSquadronVotingPortal";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import "@/styles/admin-squadron.css";
import "@/styles/pilot-squadron.css";

export const metadata = { title: "Squadron Voting" };

type PageProps = {
  searchParams: Promise<{ ballot?: string }>;
};

export default async function PilotSquadronVotingPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  await getPilotProfileByUserId(session.user.id);
  const params = await searchParams;

  return (
    <DashboardPageLayout className="admin-squadron-shell">
      <PilotSquadronVotingPortal initialBallotId={params.ballot ?? null} />
    </DashboardPageLayout>
  );
}
