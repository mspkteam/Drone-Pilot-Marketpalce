import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCertificateEnginePortal } from "@/components/admin/certificates/AdminCertificateEnginePortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { canPerform } from "@/lib/auth/moderator-permissions";
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

  const permissionConfig =
    role === "moderator"
      ? await getModeratorPermissionsFromDb(session.user.id)
      : null;
  const canManageTemplates =
    canPerform(role, session.user.id, "certificates", "create", permissionConfig) ||
    canPerform(role, session.user.id, "certificates", "edit", permissionConfig);

  return (
    <DashboardPageLayout className="admin-certificates-shell">
      <AdminCertificateEnginePortal canManageTemplates={canManageTemplates} />
    </DashboardPageLayout>
  );
}
