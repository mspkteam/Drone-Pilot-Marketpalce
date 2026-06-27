import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminVerificationPortal } from "@/components/dashboard/admin/verifications/AdminVerificationPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { countPendingVerifications } from "@/lib/verification/verification";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-verifications.css";

export const metadata = { title: "Pilot Verification" };

export default async function AdminVerificationsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const pendingCount = await countPendingVerifications();

  return (
    <DashboardPageLayout className="admin-verifications-shell">
      <AdminVerificationPortal pendingCount={pendingCount} />
    </DashboardPageLayout>
  );
}
