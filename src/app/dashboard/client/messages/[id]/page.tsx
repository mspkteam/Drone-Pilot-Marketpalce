import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ConversationThread } from "@/components/messaging/ConversationThread";
import { PageHeader } from "@/components/layout/PageHeader";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = { title: "Conversation" };

export default async function ClientConversationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <>
      <PageHeader title="Conversation" description="Message thread with your pilot." />
      <div className="mt-8">
        <ConversationThread
          conversationId={id}
          apiBase="/api/client/conversations"
          backHref="/dashboard/client/messages"
        />
      </div>
    </>
  );
}
