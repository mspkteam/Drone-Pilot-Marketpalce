import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotMessagesView } from "@/components/dashboard/pilot/messages/PilotMessagesView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/client-messages.css";

export const metadata = { title: "Messages" };

export default async function PilotMessagesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="client-messages-shell">
      <PilotMessagesView />
    </DashboardPageLayout>
  );
}
