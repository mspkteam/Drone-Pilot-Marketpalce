import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminVerificationsPanel } from "@/components/admin/AdminVerificationsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { countPendingVerifications } from "@/lib/verification/verification";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Verifications" };

export default async function AdminVerificationsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const pendingCount = await countPendingVerifications();

  return (
    <>
      <PageHeader
        title="Verifications"
        description="Review pilot licenses, insurance, and certification documents."
      />
      {pendingCount > 0 ? (
        <p className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark">
          {pendingCount} verification{pendingCount === 1 ? "" : "s"} awaiting
          review.
        </p>
      ) : null}
      <div className="mt-8 max-w-4xl">
        <AdminVerificationsPanel />
      </div>
    </>
  );
}
