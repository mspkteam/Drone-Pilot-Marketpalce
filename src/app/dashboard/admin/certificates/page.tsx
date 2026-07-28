import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCertificateEnginePortal } from "@/components/admin/certificates/AdminCertificateEnginePortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { canPerform, usesStaffPermissionMap } from "@/lib/auth/moderator-permissions";
import { getModeratorPermissionsFromDb } from "@/lib/auth/moderator-permissions-db";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-certificates.css";

export const metadata = { title: "Automated Certificates" };

export default async function AdminCertificatesPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const permissionConfig = usesStaffPermissionMap(role)
    ? await getModeratorPermissionsFromDb(session.user.id)
    : null;
  const canManageTemplates =
    canPerform(role, session.user.id, "certificates", "create", permissionConfig) ||
    canPerform(role, session.user.id, "certificates", "edit", permissionConfig);

  return (
    <DashboardPageLayout className="admin-certificates-shell">
      <Suspense fallback={<p className="admin-certificates-loading">Loading…</p>}>
        <AdminCertificateEnginePortal canManageTemplates={canManageTemplates} />
      </Suspense>
    </DashboardPageLayout>
  );
}
