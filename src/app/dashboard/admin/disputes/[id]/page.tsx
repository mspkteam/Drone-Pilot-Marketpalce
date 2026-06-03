import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminDisputeDetailPanel } from "@/components/admin/AdminDisputeDetailPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Dispute details" };

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminDisputeDetailPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <>
      <PageHeader
        title="Dispute"
        description="Review timeline, moderate, and resolve."
      />
      <div className="mt-8">
        <AdminDisputeDetailPanel disputeId={id} viewerRole={role} />
      </div>
    </>
  );
}
