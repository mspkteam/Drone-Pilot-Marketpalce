import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSupportChat } from "@/components/dashboard/admin/support/AdminSupportChat";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-support-chat.css";

export const metadata = { title: "Support Chat" };

export default async function AdminSupportPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const readOnly = role === "moderator";

  return (
    <DashboardPageLayout className="admin-support-shell">
      <AdminSupportChat readOnly={readOnly} />
    </DashboardPageLayout>
  );
}
