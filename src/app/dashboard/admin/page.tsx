import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminOperationsDashboard } from "@/components/dashboard/admin/AdminOperationsDashboard";
import { DashboardPageLayout } from "@/components/dashboard";
import { getAdminOperationsDashboardData } from "@/lib/admin/operations-dashboard-data";
import { buildDashboardUser } from "@/lib/dashboard/shell-user";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";

export const metadata = { title: "Operations Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const user = buildDashboardUser(session?.user ?? {}, {
    roleSubtitle:
      role === "moderator"
        ? "Moderator account"
        : role === "super_admin"
          ? "Super admin"
          : "Admin account",
  });

  const data = await getAdminOperationsDashboardData({
    role,
    commanderName: user.displayName,
  });

  return (
    <DashboardPageLayout className="admin-ops-shell">
      <AdminOperationsDashboard data={data} />
    </DashboardPageLayout>
  );
}
