import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentsList } from "@/components/payments/PaymentsList";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

export const metadata = { title: "Payments" };

export default async function PilotPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  const ratePercent = Math.round(DEFAULT_COMMISSION_RATE * 100);

  return (
    <>
      <PageHeader
        title="Payments"
        description={`Earnings from completed jobs (${ratePercent}% platform fee deducted).`}
      >
        <Link
          href="/dashboard/pilot/bookings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          My jobs →
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl">
        <PaymentsList
          apiPath="/api/pilot/payments"
          bookingsBase="/dashboard/pilot/bookings"
          viewerRole="pilot"
          emptyMessage="No payouts yet. Complete a booking to see your earnings."
        />
      </div>
    </>
  );
}
