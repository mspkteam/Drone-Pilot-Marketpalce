import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminRegionsPortal } from "@/components/dashboard/admin/regions/AdminRegionsPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-regions.css";

export const metadata = { title: "Regions" };

export default async function AdminRegionsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-regions-shell">
      <AdminRegionsPortal />
    </DashboardPageLayout>
  );
}
