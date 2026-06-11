import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientMessagesView } from "@/components/dashboard/client/messages/ClientMessagesView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/client-messages.css";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Messages" };

export default async function ClientConversationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <DashboardPageLayout className="client-messages-shell">
      <ClientMessagesView initialConversationId={id} />
    </DashboardPageLayout>
  );
}
