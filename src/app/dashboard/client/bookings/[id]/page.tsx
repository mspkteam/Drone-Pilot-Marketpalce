import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingDetailCard } from "@/components/bookings/BookingDetailCard";
import { BookingDisputeSection } from "@/components/disputes/BookingDisputeSection";
import { BookingPaymentSection } from "@/components/payments/BookingPaymentSection";
import { BookingReviewSection } from "@/components/reviews/BookingReviewSection";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { getBookingForClient } from "@/lib/bookings/booking";

export const metadata = { title: "Booking details" };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ accepted?: string }>;
};

export default async function ClientBookingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const { id } = await params;
  const query = await searchParams;
  const booking = await getBookingForClient(id, profile.id);

  if (!booking) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Booking" description={booking.job.title}>
        <Link
          href="/dashboard/client/bookings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All bookings
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl space-y-4">
        {query.accepted === "1" ? (
          <p
            className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark"
            role="status"
          >
            Pilot accepted. Confirm the booking to proceed.
          </p>
        ) : null}
        <BookingDetailCard
          booking={booking}
          actor="client"
          apiBase="/api/client/bookings"
        />
        <BookingPaymentSection
          bookingId={booking.id}
          bookingStatus={booking.status}
          actor="client"
        />
        <BookingDisputeSection
          bookingId={booking.id}
          bookingStatus={booking.status}
          actor="client"
        />
        <BookingReviewSection bookingId={booking.id} actor="client" />
      </div>
    </>
  );
}
