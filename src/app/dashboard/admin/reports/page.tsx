import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminReportsAnalytics } from "@/components/dashboard/admin/reports/AdminReportsAnalytics";
import { DashboardPageLayout } from "@/components/dashboard";
import { getAdminReportsAnalyticsData } from "@/lib/admin/reports-analytics-data";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-reports.css";

export const metadata = { title: "Reports & Analytics" };

export default async function AdminReportsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const data = await getAdminReportsAnalyticsData(role);

  return (
    <DashboardPageLayout className="admin-reports-shell">
      <AdminReportsAnalytics data={data} />
    </DashboardPageLayout>
  );
}
