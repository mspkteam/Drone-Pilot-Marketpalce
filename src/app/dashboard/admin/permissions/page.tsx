import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminModeratorPermissionsPortal } from "@/components/admin/permissions/AdminModeratorPermissionsPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { getAdminPermissionsEngineData } from "@/lib/admin/permissions-engine";
import { roleMeetsRequirement } from "@/lib/auth/permissions";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-personnel.css";
import "@/styles/admin-permissions.css";

export const metadata = { title: "Staff Permissions" };

export default async function AdminPermissionsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const canManage = roleMeetsRequirement(role, "super_admin");
  const initialData = canManage
    ? await getAdminPermissionsEngineData()
    : null;

  return (
    <DashboardPageLayout className="admin-perms-shell">
      <AdminModeratorPermissionsPortal
        canManage={canManage}
        initialData={initialData}
      />
    </DashboardPageLayout>
  );
}
