import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";

export const metadata = { title: "Reviews" };

export default async function PilotReviewsPage() {
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
        title="Reviews"
        description="Reviews you have given and received on completed missions."
      >
        <Link
          href="/dashboard/pilot/bookings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          My jobs →
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
            . Reviews appear after completed bookings.
          </p>
        ) : (
          <ReviewsList
            apiPath="/api/pilot/reviews"
            bookingsBase="/dashboard/pilot/bookings"
            emptyMessage="No reviews yet. Complete a booking and leave a review from the booking page."
          />
        )}
      </div>
    </>
  );
}
