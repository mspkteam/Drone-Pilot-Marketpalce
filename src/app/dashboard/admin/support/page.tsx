import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSupportPanel } from "@/components/admin/AdminSupportPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Support Chat" };

export default async function AdminSupportPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const readOnly = role === "moderator";

  return (
    <>
      <PageHeader
        title="Support Chat"
        description={
          readOnly
            ? "View platform support conversations (read-only)."
            : "Manage and reply to platform support conversations."
        }
      />
      <div className="mt-8 max-w-4xl">
        <AdminSupportPanel readOnly={readOnly} />
      </div>
    </>
  );
}
