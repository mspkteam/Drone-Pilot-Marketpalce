import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminBookingsPanel } from "@/components/admin/AdminBookingsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Bookings" };

export default async function AdminBookingsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Monitor and support booking lifecycle across the platform."
      />
      <div className="mt-8 max-w-4xl">
        <AdminBookingsPanel />
      </div>
    </>
  );
}
