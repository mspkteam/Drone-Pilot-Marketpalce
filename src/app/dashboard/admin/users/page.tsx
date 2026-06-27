import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminFleetPersonnel } from "@/components/dashboard/admin/personnel/AdminFleetPersonnel";
import { DashboardPageLayout } from "@/components/dashboard";
import { getPersonnelDirectoryData } from "@/lib/admin/personnel-directory";
import { canPerform } from "@/lib/auth/moderator-permissions";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-personnel.css";

export const metadata = { title: "Fleet & Personnel" };

export default async function AdminUsersPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const permissionConfig =
    role === "moderator"
      ? await getModeratorPermissionsFromDb(session.user.id)
      : null;
  const canEditUsers = canPerform(role, session.user.id, "users", "edit", permissionConfig);
  const data = await getPersonnelDirectoryData({ isSuperAdmin: canEditUsers });

  return (
    <DashboardPageLayout className="admin-personnel-shell">
      <AdminFleetPersonnel data={data} />
    </DashboardPageLayout>
  );
}
