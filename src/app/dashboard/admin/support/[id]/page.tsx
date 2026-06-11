import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSupportChat } from "@/components/dashboard/admin/support/AdminSupportChat";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-support-chat.css";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = { title: "Support thread" };

export default async function AdminSupportThreadPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;
  const readOnly = role === "moderator";

  return (
    <DashboardPageLayout className="admin-support-shell">
      <AdminSupportChat readOnly={readOnly} initialChatId={id} />
    </DashboardPageLayout>
  );
}
