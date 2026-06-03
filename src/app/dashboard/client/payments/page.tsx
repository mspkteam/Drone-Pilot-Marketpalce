import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaymentsList } from "@/components/payments/PaymentsList";
import {
  getClientProfileByUserId,
  isOnboardingComplete,
} from "@/lib/client/profile";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";

export const metadata = { title: "Payments" };

export default async function ClientPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/client/onboarding");
  }

  const ratePercent = Math.round(DEFAULT_COMMISSION_RATE * 100);

  return (
    <>
      <PageHeader
        title="Payments"
        description={`Payment history and ${ratePercent}% platform commission on completed bookings.`}
      >
        <Link
          href="/dashboard/client/bookings"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Bookings →
        </Link>
      </PageHeader>

      <div className="mt-8 max-w-3xl">
        <PaymentsList
          apiPath="/api/client/payments"
          bookingsBase="/dashboard/client/bookings"
          viewerRole="client"
          emptyMessage="No payments yet. Complete a booking to generate a payment record."
        />
      </div>
    </>
  );
}
