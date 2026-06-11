import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientPostProjectWizard } from "@/components/dashboard/client/post-project/ClientPostProjectWizard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "Post a new project" };

export default async function ClientPostJobPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  return <ClientPostProjectWizard />;
}
