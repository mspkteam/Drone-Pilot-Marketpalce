import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientMessagesView } from "@/components/dashboard/client/messages/ClientMessagesView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/client-messages.css";

export const metadata = { title: "Messages" };

type PageProps = {
  searchParams: Promise<{ pilot?: string; counter?: string; conversation?: string }>;
};

export default async function ClientMessagesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const params = await searchParams;
  const counterAmount = params.counter?.trim() || null;
  const counterDraft = counterAmount
    ? `Hi — I'd like to propose a counter offer of ${counterAmount}. Let me know if that works for you.`
    : null;

  return (
    <DashboardPageLayout className="client-messages-shell">
      <ClientMessagesView
        preferredPilotId={params.pilot ?? null}
        initialConversationId={params.conversation ?? undefined}
        initialDraft={counterDraft}
      />
    </DashboardPageLayout>
  );
}
