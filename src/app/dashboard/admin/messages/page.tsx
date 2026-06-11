import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminMessagesTracking } from "@/components/dashboard/admin/messages/AdminMessagesTracking";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-messages.css";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="admin-messages-shell">
      <AdminMessagesTracking />
    </DashboardPageLayout>
  );
}
