import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminBackgroundChecksPortal } from "@/components/dashboard/admin/background-checks/AdminBackgroundChecksPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/background-check.css";

export const metadata = { title: "Background Checks" };

export default async function AdminBackgroundChecksPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="bgc-shell">
      <AdminBackgroundChecksPortal />
    </DashboardPageLayout>
  );
}
