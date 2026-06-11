import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientProfileCompletionView } from "@/components/dashboard/client/profile/ClientProfileCompletionView";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getClientProfileByUserId,
  toClientProfileDto,
} from "@/lib/client/profile";
import "@/styles/profile-onboarding.css";

export const metadata = { title: "Profile" };

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  const profileDto = profile ? toClientProfileDto(profile) : null;

  return (
    <DashboardPageLayout className="profile-onboarding-shell">
      <ClientProfileCompletionView
        profile={profileDto}
        accountEmail={session.user.email ?? undefined}
      />
    </DashboardPageLayout>
  );
}
