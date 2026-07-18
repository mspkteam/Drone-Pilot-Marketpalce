import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCmsResourceEditor } from "@/components/admin/cms/AdminCmsResourceEditor";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-cms.css";

export const metadata = { title: "New Resource" };

export default async function AdminCmsNewResourcePage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-cms-shell">
      <AdminCmsResourceEditor />
    </DashboardPageLayout>
  );
}
