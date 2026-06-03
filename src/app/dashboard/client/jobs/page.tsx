import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ClientJobsList } from "@/components/client/ClientJobsList";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "My Jobs" };

type PageProps = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function ClientJobsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const params = await searchParams;

  return (
    <>
      <PageHeader
        title="My Jobs"
        description="Manage posted jobs, approval status, and offers."
      >
        <Button href="/dashboard/client/jobs/new" size="sm">
          Post new job
        </Button>
      </PageHeader>

      <div className="mt-8 max-w-3xl space-y-4">
        {params.submitted === "1" ? (
          <p
            className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark"
            role="status"
          >
            Job submitted for admin approval. Pilots will see it after approval
            (M07).
          </p>
        ) : null}
        <ClientJobsList />
      </div>
    </>
  );
}
