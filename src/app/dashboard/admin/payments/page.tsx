import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCommissionsPortal } from "@/components/admin/commissions/AdminCommissionsPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-commissions.css";

export const metadata = { title: "Pilot Commissions" };

export default async function AdminPaymentsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-commissions-shell">
      <AdminCommissionsPortal />
    </DashboardPageLayout>
  );
}
