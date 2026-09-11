import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientPostProjectWizard } from "@/components/dashboard/client/post-project/ClientPostProjectWizard";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "Post a new project" };

type PageProps = {
  searchParams: Promise<{
    preferredPilot?: string;
    preferredPilotName?: string;
  }>;
};

export default async function ClientPostJobPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const params = await searchParams;
  const preferredPilotName = params.preferredPilotName?.trim() || null;

  return (
    <>
      {preferredPilotName ? (
        <div className="client-preferred-pilot-banner" role="status">
          Hiring <strong>{preferredPilotName}</strong> via marketplace — post
          this project, then review their quote when they submit a proposal.
        </div>
      ) : null}
      <ClientPostProjectWizard />
    </>
  );
}
