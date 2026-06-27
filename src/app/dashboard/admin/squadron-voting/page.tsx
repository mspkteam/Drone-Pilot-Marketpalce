import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSquadronVotingPortal } from "@/components/dashboard/admin/squadron-voting/AdminSquadronVotingPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-squadron.css";

export const metadata = { title: "Squadron Voting" };

export default async function AdminSquadronVotingPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-squadron-shell">
      <AdminSquadronVotingPortal />
    </DashboardPageLayout>
  );
}
