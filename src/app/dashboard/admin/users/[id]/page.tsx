import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminMemberDetailView } from "@/components/dashboard/admin/personnel/AdminMemberDetailView";
import { DashboardPageLayout } from "@/components/dashboard";
import { getMemberDetailForAdmin } from "@/lib/admin/member-detail";
import { canPerform, usesStaffPermissionMap } from "@/lib/auth/moderator-permissions";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-personnel.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = { title: "Member profile" };

export default async function AdminMemberDetailPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const permissionConfig = usesStaffPermissionMap(role)
    ? await getModeratorPermissionsFromDb(session.user.id)
    : null;
  if (!canPerform(role, session.user.id, "users", "view", permissionConfig)) {
    redirect("/dashboard/admin");
  }

  const { id } = await params;
  const member = await getMemberDetailForAdmin(id);
  if (!member) notFound();

  const canEdit = canPerform(
    role,
    session.user.id,
    "users",
    "edit",
    permissionConfig,
  );
  const canAssignBadges = canPerform(
    role,
    session.user.id,
    "badges",
    "assign",
    permissionConfig,
  );
  const isSuperAdmin = role === "super_admin";

  return (
    <DashboardPageLayout className="admin-personnel-shell">
      <AdminMemberDetailView
        member={member}
        canEdit={canEdit}
        canAssignBadges={canAssignBadges}
        isSuperAdmin={isSuperAdmin}
      />
    </DashboardPageLayout>
  );
}
