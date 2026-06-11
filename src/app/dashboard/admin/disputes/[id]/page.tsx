import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDisputeDetailView } from "@/components/dashboard/admin/disputes/AdminDisputeDetailView";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getConversationIdForBooking,
} from "@/lib/admin/dispute-center";
import { getDisputeForAdmin } from "@/lib/disputes/dispute";
import { isAdminRole, type UserRole } from "@/types/roles";
import "@/styles/admin-dashboard.css";
import "@/styles/admin-disputes.css";

export const metadata = { title: "Dispute details" };

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminDisputeDetailPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;
  const result = await getDisputeForAdmin(id, {
    userId: session.user.id,
    role,
  });

  if (!result.ok) {
    if (result.status === 404) notFound();
    redirect("/dashboard/admin/disputes");
  }

  const conversationId = await getConversationIdForBooking(
    result.dispute.bookingId,
  );

  return (
    <DashboardPageLayout className="admin-dispute-shell">
      <AdminDisputeDetailView
        initialDispute={result.dispute}
        conversationId={conversationId}
        viewerRole={role}
      />
    </DashboardPageLayout>
  );
}
