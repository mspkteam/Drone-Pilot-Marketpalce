import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientOnboardingForm } from "@/components/client/ClientOnboardingForm";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "Client onboarding" };

export default async function ClientOnboardingPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (isOnboardingComplete(profile)) {
    redirect("/dashboard/client");
  }

  return (
    <>
      <PageHeader
        badge="Onboarding"
        title="Set up your client account"
        description="Add your contact and billing details so you can post drone jobs on the marketplace."
      />
      <div className="mt-8 max-w-3xl">
        <ClientOnboardingForm />
      </div>
    </>
  );
}
