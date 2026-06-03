import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientProfileEditor } from "@/components/client/ClientProfileEditor";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
  toClientProfileDto,
} from "@/lib/client/profile";

export const metadata = { title: "Profile" };

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);

  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your company and billing contact information."
      />
      <div className="mt-8 max-w-3xl">
        <ClientProfileEditor profile={toClientProfileDto(profile)} />
      </div>
    </>
  );
}
