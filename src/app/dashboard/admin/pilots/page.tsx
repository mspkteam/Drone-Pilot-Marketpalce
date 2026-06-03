import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminPilotsPanel } from "@/components/admin/AdminPilotsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/db";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Pilots" };

export default async function AdminPilotsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const pendingCount = await prisma.pilotProfile.count({
    where: { status: "pending_review" },
  });

  return (
    <>
      <PageHeader
        title="Pilots"
        description="Review and manage pilot accounts and profiles."
      />
      {pendingCount > 0 ? (
        <p className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark">
          {pendingCount} pilot profile{pendingCount === 1 ? "" : "s"} awaiting
          approval.
        </p>
      ) : null}
      <div className="mt-8 w-full">
        <AdminPilotsPanel />
      </div>
    </>
  );
}
