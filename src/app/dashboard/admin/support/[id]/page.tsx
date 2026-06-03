import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSupportThread } from "@/components/admin/AdminSupportThread";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Support thread" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSupportThreadPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;
  const readOnly = role === "moderator";

  return (
    <>
      <PageHeader
        title="Support conversation"
        description={
          readOnly
            ? "Read-only moderator view."
            : "Reply and update status for this support request."
        }
      />
      <div className="mt-8 w-full">
        <AdminSupportThread chatId={id} readOnly={readOnly} />
      </div>
    </>
  );
}
