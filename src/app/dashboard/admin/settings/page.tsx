import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminConfigurationPortal } from "@/components/admin/configuration/AdminConfigurationPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { canPerform, usesStaffPermissionMap } from "@/lib/auth/moderator-permissions";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-configuration.css";

export const metadata = { title: "Configuration" };

export default async function AdminSettingsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }
  const permissionConfig = usesStaffPermissionMap(role)
    ? await getModeratorPermissionsFromDb(session.user.id)
    : null;
  const canManage = canPerform(
    role,
    session.user.id,
    "configuration",
    "manageSettings",
    permissionConfig,
  );

  return (
    <DashboardPageLayout className="admin-config-shell">
      <AdminConfigurationPortal canManage={canManage} />
    </DashboardPageLayout>
  );
}
