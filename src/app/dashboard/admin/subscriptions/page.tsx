import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminTierPlansPortal } from "@/components/admin/subscriptions/AdminTierPlansPortal";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-subscriptions.css";

export const metadata = { title: "Pilot Tier Plans" };

export default async function AdminSubscriptionsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }
  return (
    <DashboardPageLayout className="admin-subscriptions-shell">
      <AdminTierPlansPortal />
    </DashboardPageLayout>
  );
}
