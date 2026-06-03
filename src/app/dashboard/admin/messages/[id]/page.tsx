import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminConversationThread } from "@/components/admin/AdminConversationThread";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Conversation" };

export default async function AdminConversationPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <>
      <PageHeader title="Conversation" description="Admin read-only transcript." />
      <div className="mt-8">
        <AdminConversationThread conversationId={id} />
      </div>
    </>
  );
}
