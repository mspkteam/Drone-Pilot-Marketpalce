import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCmsResourcesList } from "@/components/admin/cms/AdminCmsResourcesList";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-cms.css";

export const metadata = { title: "CMS Resources" };

export default async function AdminCmsResourcesPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-cms-shell">
      <AdminCmsResourcesList />
    </DashboardPageLayout>
  );
}
