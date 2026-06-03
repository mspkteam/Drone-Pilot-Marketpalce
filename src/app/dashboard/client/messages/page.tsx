import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessagesInbox } from "@/components/messaging/MessagesInbox";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Messages" };

export default async function ClientMessagesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Messages"
        description="Chat with pilots who have bid on your jobs. You can start a thread after receiving an application."
      />
      <div className="mt-8">
        <MessagesInbox
          role="client"
          listApi="/api/client/conversations"
          threadBase="/dashboard/client/messages"
        />
      </div>
    </>
  );
}
