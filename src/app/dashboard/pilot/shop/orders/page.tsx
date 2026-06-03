import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotUniformOrdersList } from "@/components/shop/PilotUniformOrdersList";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

export const metadata = { title: "Uniform orders" };

export default async function PilotShopOrdersPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile || !isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <>
      <PageHeader title="Uniform orders" description="Track shop orders and payment." />
      <div className="mt-8 max-w-2xl">
        <PilotUniformOrdersList />
      </div>
    </>
  );
}
