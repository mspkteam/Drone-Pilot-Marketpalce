import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminMessagesTracking } from "@/components/dashboard/admin/messages/AdminMessagesTracking";
import { DashboardPageLayout } from "@/components/dashboard";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-messages.css";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Conversation" };

export default async function AdminConversationPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <DashboardPageLayout className="admin-messages-shell">
      <AdminMessagesTracking initialConversationId={id} />
    </DashboardPageLayout>
  );
}
