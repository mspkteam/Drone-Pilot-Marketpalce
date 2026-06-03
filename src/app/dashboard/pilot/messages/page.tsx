import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MessagesInbox } from "@/components/messaging/MessagesInbox";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Messages" };

export default async function PilotMessagesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Messages"
        description="Reply to clients who message you about your job applications."
      />
      <div className="mt-8">
        <MessagesInbox
          role="pilot"
          listApi="/api/pilot/conversations"
          threadBase="/dashboard/pilot/messages"
        />
      </div>
    </>
  );
}
