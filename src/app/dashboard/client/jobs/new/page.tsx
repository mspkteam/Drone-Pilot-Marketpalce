import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JobPostForm } from "@/components/client/JobPostForm";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "Post Job" };

export default async function ClientPostJobPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  return (
    <>
      <PageHeader
        title="Post a job"
        description="Describe your drone mission. Save as draft or submit for admin approval before pilots can bid."
      />
      <div className="mt-8 max-w-3xl">
        <JobPostForm />
      </div>
    </>
  );
}
