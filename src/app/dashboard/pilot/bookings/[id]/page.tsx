import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingDetailCard } from "@/components/bookings/BookingDetailCard";
import { BookingPaymentSection } from "@/components/payments/BookingPaymentSection";
import { BookingDisputeSection } from "@/components/disputes/BookingDisputeSection";
import { BookingReviewSection } from "@/components/reviews/BookingReviewSection";
import { PageHeader } from "@/components/layout/PageHeader";
import { getBookingForPilot } from "@/lib/bookings/booking";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

export const metadata = { title: "Booking details" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PilotBookingDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile) || profile.status !== "approved") {
    redirect("/dashboard/pilot/contracts");
  }

  const { id } = await params;
  const booking = await getBookingForPilot(id, profile.id);

  if (!booking) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Booking" description={booking.job.title}>
        <Link
          href="/dashboard/pilot/contracts"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Active contracts
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl space-y-6">
        <BookingDetailCard
          booking={booking}
          actor="pilot"
          apiBase="/api/pilot/bookings"
        />
        <BookingPaymentSection
          bookingId={booking.id}
          bookingStatus={booking.status}
          actor="pilot"
        />
        <BookingDisputeSection
          bookingId={booking.id}
          bookingStatus={booking.status}
          actor="pilot"
        />
        <BookingReviewSection bookingId={booking.id} actor="pilot" />
      </div>
    </>
  );
}
