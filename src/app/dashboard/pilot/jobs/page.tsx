import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { PilotOpenJobsList } from "@/components/pilot/PilotOpenJobsList";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";

export const metadata = { title: "Find Jobs" };

export default async function PilotJobsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  const approved = profile?.status === "approved";

  return (
    <>
      <PageHeader
        title="Find Jobs"
        description="Browse admin-approved jobs open for pilot applications."
      >
        <Link
          href="/dashboard/pilot/applications"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          My applications →
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl space-y-4">
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
            You can browse and bid once an admin approves your pilot profile.
          </p>
        ) : null}
        {approved ? <PilotOpenJobsList /> : null}
      </div>
    </>
  );
}
