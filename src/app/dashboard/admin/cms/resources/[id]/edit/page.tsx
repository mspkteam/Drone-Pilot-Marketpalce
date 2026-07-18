import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCmsResourceEditor } from "@/components/admin/cms/AdminCmsResourceEditor";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-cms.css";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Edit Resource" };

export default async function AdminCmsEditResourcePage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <DashboardPageLayout className="admin-cms-shell">
      <AdminCmsResourceEditor resourceId={id} />
    </DashboardPageLayout>
  );
}
