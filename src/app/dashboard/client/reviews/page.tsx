import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "Reviews" };

export default async function ClientReviewsPage() {
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
        title="Reviews"
        description="Reviews you have given and received on completed bookings."
      >
        <Link
          href="/dashboard/client/bookings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Bookings →
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl">
        <ReviewsList
          apiPath="/api/client/reviews"
          bookingsBase="/dashboard/client/bookings"
          emptyMessage="No reviews yet. Complete a booking and leave a review from the booking page."
        />
      </div>
    </>
  );
}
