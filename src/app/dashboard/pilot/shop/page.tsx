import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotUniformShop } from "@/components/shop/PilotUniformShop";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";

export const metadata = { title: "Uniform Shop" };

export default async function PilotShopPage() {
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
      <PageHeader
        title="Uniform Shop"
        description="Official apparel and gear — separate from marketplace job payments."
      />
      <div className="mt-8">
        <PilotUniformShop />
      </div>
    </>
  );
}
