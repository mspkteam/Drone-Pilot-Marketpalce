import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingsList } from "@/components/bookings/BookingsList";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";

export const metadata = { title: "Bookings" };

export default async function ClientBookingsPage() {
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
        title="Bookings"
        description="Track assigned pilots and booking progress."
      >
        <Link
          href="/dashboard/client/jobs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          My jobs →
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl">
        <BookingsList
          apiPath="/api/client/bookings"
          detailBase="/dashboard/client/bookings"
          emptyMessage="No bookings yet. Accept a pilot offer on one of your jobs to create a booking."
        />
      </div>
    </>
  );
}
