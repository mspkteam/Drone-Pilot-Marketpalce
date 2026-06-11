import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminOperationsDashboard } from "@/components/dashboard/admin/AdminOperationsDashboard";
import { DashboardPageLayout } from "@/components/dashboard";
import { getAdminOperationsDashboardData } from "@/lib/admin/operations-dashboard-data";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";

export const metadata = { title: "Operations Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const commanderName =
    session.user.email?.split("@")[0]?.toUpperCase() ?? "COMMANDER";

  const data = await getAdminOperationsDashboardData({
    role,
    commanderName,
  });

  return (
    <DashboardPageLayout className="admin-ops-shell">
      <AdminOperationsDashboard data={data} />
    </DashboardPageLayout>
  );
}
