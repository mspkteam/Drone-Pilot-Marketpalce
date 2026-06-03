import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminReviewsPanel } from "@/components/admin/AdminReviewsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Moderate post-booking reviews — publish, hide, or flag."
      />
      <div className="mt-8 max-w-4xl">
        <AdminReviewsPanel />
      </div>
    </>
  );
}
