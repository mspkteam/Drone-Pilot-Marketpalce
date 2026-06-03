import { getClientProfileByUserId, isOnboardingComplete } from "@/lib/client/profile";

export async function requireOnboardedClient(userId: string) {
  const profile = await getClientProfileByUserId(userId);
  if (!profile || !isOnboardingComplete(profile)) {
    return { ok: false as const, error: "Complete client onboarding first." };
  }
  return { ok: true as const, profile };
}
