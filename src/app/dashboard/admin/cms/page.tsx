import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCmsOverviewPortal } from "@/components/admin/cms/AdminCmsOverviewPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-cms.css";

export const metadata = { title: "CMS Collections" };

export default async function AdminCmsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }
  return (
    <DashboardPageLayout className="admin-cms-shell">
      <AdminCmsOverviewPortal />
    </DashboardPageLayout>
  );
}
