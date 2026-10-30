"use client";

import { OnboardingGate } from "@/components/dashboard/OnboardingGate";

const ALLOWED_WITHOUT_ONBOARDING = [
  "/dashboard/client/profile",
  "/dashboard/client/onboarding",
  "/dashboard/client/settings",
] as const;

type OnboardingRedirectProps = {
  needsOnboarding: boolean;
};

export function OnboardingRedirect({ needsOnboarding }: OnboardingRedirectProps) {
  return (
    <OnboardingGate
      needsOnboarding={needsOnboarding}
      profileHref="/dashboard/client/profile"
      allowedPrefixes={ALLOWED_WITHOUT_ONBOARDING}
      roleLabel="client"
    />
  );
}
