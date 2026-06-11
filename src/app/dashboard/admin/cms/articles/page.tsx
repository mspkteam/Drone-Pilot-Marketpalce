import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCmsArticlesList } from "@/components/admin/cms/AdminCmsArticlesList";
import { DashboardPageLayout } from "@/components/dashboard";
import { roleMeetsRequirement } from "@/lib/auth/permissions";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-cms.css";

export const metadata = { title: "CMS Articles" };

export default async function AdminCmsArticlesPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }
  if (!roleMeetsRequirement(role, "super_admin")) {
    redirect("/dashboard/admin");
  }

  return (
    <DashboardPageLayout className="admin-cms-shell">
      <AdminCmsArticlesList />
    </DashboardPageLayout>
  );
}
