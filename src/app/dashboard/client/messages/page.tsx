import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientMessagesView } from "@/components/dashboard/client/messages/ClientMessagesView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/client-messages.css";

export const metadata = { title: "Messages" };

type PageProps = {
  searchParams: Promise<{ pilot?: string }>;
};

export default async function ClientMessagesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <DashboardPageLayout className="client-messages-shell">
      <ClientMessagesView preferredPilotId={params.pilot ?? null} />
    </DashboardPageLayout>
  );
}
