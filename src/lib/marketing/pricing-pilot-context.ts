import { auth } from "@/auth";
import {
  RECOMMENDED_PRICING_PLAN_CODE,
  TIER_CODE_TO_PRICING_PLAN_CODE,
} from "@/lib/membership/pricing-tier-codes";
import { getPilotProfileByUserId } from "@/lib/pilot/profile";
import { getCurrentPilotSubscription } from "@/lib/subscriptions/subscription";

export { RECOMMENDED_PRICING_PLAN_CODE, TIER_CODE_TO_PRICING_PLAN_CODE };

export type PricingPilotContext = {
  isPilot: boolean;
  currentPlanCode: string | null;
};

export async function getPricingPilotContext(): Promise<PricingPilotContext> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "pilot") {
    return { isPilot: false, currentPlanCode: null };
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!profile) {
    return { isPilot: true, currentPlanCode: null };
  }

  const subscription = await getCurrentPilotSubscription(profile.id);
  if (!subscription?.plan.code) {
    return { isPilot: true, currentPlanCode: null };
  }

  const currentPlanCode =
    TIER_CODE_TO_PRICING_PLAN_CODE[subscription.plan.code] ?? null;

  return { isPilot: true, currentPlanCode };
}

export function getPricingPlanButtonHref(isPilot: boolean): string {
  return isPilot ? "/dashboard/pilot/subscription" : "/register?role=pilot";
}
