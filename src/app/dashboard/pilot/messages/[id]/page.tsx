import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ConversationThread } from "@/components/messaging/ConversationThread";
import { PageHeader } from "@/components/layout/PageHeader";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Conversation" };

export default async function PilotConversationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <>
      <PageHeader title="Conversation" description="Message thread with your client." />
      <div className="mt-8">
        <ConversationThread
          conversationId={id}
          apiBase="/api/pilot/conversations"
          backHref="/dashboard/pilot/messages"
        />
      </div>
    </>
  );
}
