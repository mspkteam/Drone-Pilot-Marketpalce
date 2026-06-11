import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientMessagesView } from "@/components/dashboard/client/messages/ClientMessagesView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/client-messages.css";

export const metadata = { title: "Messages" };

export default async function ClientMessagesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="client-messages-shell">
      <ClientMessagesView />
    </DashboardPageLayout>
  );
}
