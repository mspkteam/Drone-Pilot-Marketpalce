import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminModeratorPermissionsPortal } from "@/components/admin/permissions/AdminModeratorPermissionsPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { roleMeetsRequirement } from "@/lib/auth/permissions";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-permissions.css";

export const metadata = { title: "Moderator Permissions" };

export default async function AdminPermissionsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const canManage = roleMeetsRequirement(role, "super_admin");

  return (
    <DashboardPageLayout className="admin-perms-shell">
      <AdminModeratorPermissionsPortal canManage={canManage} />
    </DashboardPageLayout>
  );
}
