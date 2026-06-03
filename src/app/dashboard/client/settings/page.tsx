import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettingsPanel } from "@/components/settings/AccountSettingsPanel";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Settings" };

export default async function ClientSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Account, password, and notification preferences."
      />
      <div className="mt-8">
        <AccountSettingsPanel
          role="client"
          profileHref="/dashboard/client/profile"
        />
      </div>
    </>
  );
}
