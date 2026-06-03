import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { PilotApplicationsList } from "@/components/pilot/PilotApplicationsList";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";

export const metadata = { title: "My Applications" };

type PageProps = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function PilotApplicationsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  const params = await searchParams;
  const approved = profile?.status === "approved";

  return (
    <>
      <PageHeader
        title="My Applications"
        description="Track bids and applications you have submitted."
      >
        <Link
          href="/dashboard/pilot/jobs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Find jobs →
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl space-y-4">
        {params.submitted === "1" ? (
          <p
            className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark"
            role="status"
          >
            Application submitted successfully.
          </p>
        ) : null}

        {!approved ? (
          <p
            className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark"
            role="status"
          >
            Profile status:{" "}
            <strong>
              {getProfileStatusLabel(
                (profile?.status ?? "draft") as PilotProfileStatus,
              )}
            </strong>
            .
            Applications appear here after your profile is approved and you submit
            bids.
          </p>
        ) : null}

        {approved ? <PilotApplicationsList /> : null}
      </div>
    </>
  );
}
