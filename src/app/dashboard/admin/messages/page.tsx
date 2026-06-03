import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminMessagesPanel } from "@/components/admin/AdminMessagesPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Messages"
        description="Read-only view of client–pilot conversations for support and disputes."
      />
      <div className="mt-8 w-full">
        <AdminMessagesPanel />
      </div>
    </>
  );
}
