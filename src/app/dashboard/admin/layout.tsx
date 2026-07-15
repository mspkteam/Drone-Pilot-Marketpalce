import { auth } from "@/auth";
import { ModeratorRouteGuard } from "@/components/admin/ModeratorRouteGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ModeratorPermissionsProvider } from "@/contexts/ModeratorPermissionsContext";
import { buildDashboardUser } from "@/lib/dashboard/shell-user";
import { getMilestoneShellProps } from "@/lib/milestone-shell-props";
import {
  filterAdminNavForPermissions,
  usesStaffPermissionMap,
} from "@/lib/auth/moderator-permissions";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { adminNavGroups } from "@/lib/navigation/dashboard-admin";
import type { UserRole } from "@/types/roles";
import "@/styles/admin-permissions.css";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user?.role ?? "guest") as UserRole;
  const userId = session?.user?.id ?? null;
  const permissionConfig =
    usesStaffPermissionMap(role) && userId
      ? await getModeratorPermissionsFromDb(userId)
      : null;

  const navGroups = filterAdminNavForPermissions(
    adminNavGroups,
    role,
    userId ?? undefined,
    permissionConfig,
  );

  const user = buildDashboardUser(session?.user ?? {}, {
    roleSubtitle:
      role === "moderator"
        ? "Moderator account"
        : role === "super_admin"
          ? "Super admin"
          : role === "admin"
            ? "Admin account"
            : "Admin account",
  });

  const milestone = getMilestoneShellProps(role);

  return (
    <ModeratorPermissionsProvider
      role={role}
      userId={userId}
      config={permissionConfig}
    >
      <DashboardShell
        homeHref="/dashboard/admin"
        navGroups={navGroups}
        user={user}
        {...milestone}
      >
        <ModeratorRouteGuard role={role} userId={userId} config={permissionConfig}>
          {children}
        </ModeratorRouteGuard>
      </DashboardShell>
    </ModeratorPermissionsProvider>
  );
}
