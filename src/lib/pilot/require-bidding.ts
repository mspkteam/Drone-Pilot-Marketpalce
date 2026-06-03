import { getPilotActiveTier } from "@/lib/membership/membership";
import { getPilotProfileByUserId, isOnboardingComplete } from "@/lib/pilot/profile";
import type { PilotProfileStatus } from "@/types/pilot";

export async function requirePilotEligibleToBid(userId: string) {
  const profile = await getPilotProfileByUserId(userId);

  if (!profile || !isOnboardingComplete(profile)) {
    return {
      ok: false as const,
      status: 403 as const,
      error: "Complete pilot onboarding first.",
    };
  }

  const status = profile.status as PilotProfileStatus;
  if (status !== "approved") {
    return {
      ok: false as const,
      status: 403 as const,
      error:
        "Your pilot profile must be approved before you can browse jobs and submit bids.",
    };
  }

  const tier = await getPilotActiveTier(profile.id);
  if (!tier) {
    return {
      ok: false as const,
      status: 403 as const,
      error:
        "Enroll in a membership tier (A-1 through A-6) before browsing marketplace jobs.",
    };
  }

  return { ok: true as const, profile, tier };
}
