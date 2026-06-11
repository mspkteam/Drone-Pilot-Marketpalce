import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminBadgesWingsPortal } from "@/components/admin/badges/AdminBadgesWingsPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { canPerform, getModeratorPermissions } from "@/lib/auth/moderator-permissions";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-badges.css";

export const metadata = { title: "Badges & Wings" };

export default async function AdminAchievementsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }
  const permissionConfig =
    role === "moderator" ? getModeratorPermissions(session.user.id) : null;
  const canManage =
    canPerform(role, session.user.id, "badges", "create", permissionConfig) ||
    canPerform(role, session.user.id, "badges", "edit", permissionConfig) ||
    canPerform(role, session.user.id, "badges", "assign", permissionConfig);

  return (
    <DashboardPageLayout className="admin-badges-shell">
      <AdminBadgesWingsPortal canManage={canManage} />
    </DashboardPageLayout>
  );
}
