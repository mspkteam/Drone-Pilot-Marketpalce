import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDisputeCenter } from "@/components/dashboard/admin/disputes/AdminDisputeCenter";
import { DashboardPageLayout } from "@/components/dashboard";
import { getDisputeCenterData } from "@/lib/admin/dispute-center";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-disputes.css";

export const metadata = { title: "Disputes" };

export default async function AdminDisputesPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const initialData = await getDisputeCenterData();

  return (
    <DashboardPageLayout className="admin-dispute-shell">
      <AdminDisputeCenter initialData={initialData} viewerRole={role} />
    </DashboardPageLayout>
  );
}
