import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotMessagesView } from "@/components/dashboard/pilot/messages/PilotMessagesView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/client-messages.css";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Messages" };

export default async function PilotConversationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <DashboardPageLayout className="client-messages-shell">
      <PilotMessagesView initialConversationId={id} />
    </DashboardPageLayout>
  );
}
