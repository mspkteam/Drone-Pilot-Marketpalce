import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminPaymentsPanel } from "@/components/admin/AdminPaymentsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Payments"
        description="Payments and commission records from completed bookings."
      />
      <div className="mt-8 w-full">
        <AdminPaymentsPanel />
      </div>
    </>
  );
}
