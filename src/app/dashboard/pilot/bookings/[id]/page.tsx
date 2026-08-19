import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotBookingDetailView } from "@/components/dashboard/pilot/bookings/PilotBookingDetailView";
import { DashboardPageLayout } from "@/components/dashboard";
import { getBookingForPilot } from "@/lib/bookings/booking";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-booking-detail.css";

export const metadata = { title: "Contract details" };

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
    <DashboardPageLayout className="pilot-booking-shell">
      <PilotBookingDetailView booking={booking} />
    </DashboardPageLayout>
  );
}
