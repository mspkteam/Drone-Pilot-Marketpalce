import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotMessagesView } from "@/components/dashboard/pilot/messages/PilotMessagesView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/client-messages.css";
import "@/styles/pilot-messages.css";

export const metadata = { title: "Messages" };

type PageProps = {
  searchParams: Promise<{ conversation?: string; intent?: string }>;
};

const REVISION_DRAFT =
  "Hi — I'd like to request a revision on the current scope/deliverables. Please review the details below and confirm how you'd like to proceed:\n\n";

export default async function PilotMessagesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const params = await searchParams;
  if (params.conversation) {
    const intent =
      params.intent === "revision" ? "?intent=revision" : "";
    redirect(`/dashboard/pilot/messages/${params.conversation}${intent}`);
  }

  const initialDraft =
    params.intent === "revision" ? REVISION_DRAFT : undefined;

  return (
    <DashboardPageLayout className="pilot-messages-shell">
      <PilotMessagesView initialDraft={initialDraft} />
    </DashboardPageLayout>
  );
}
