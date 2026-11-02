"use client";

import { OnboardingGate } from "@/components/dashboard/OnboardingGate";

const ALLOWED_WITHOUT_ONBOARDING = [
  "/dashboard/pilot/profile",
  "/dashboard/pilot/onboarding",
  "/dashboard/pilot/verifications",
  "/dashboard/pilot/portfolio",
  "/dashboard/pilot/settings",
  "/dashboard/pilot/support",
] as const;

const EXACT_ALLOWED = ["/dashboard/pilot"] as const;

type OnboardingRedirectProps = {
  needsOnboarding: boolean;
};

export function OnboardingRedirect({ needsOnboarding }: OnboardingRedirectProps) {
  return (
    <OnboardingGate
      needsOnboarding={needsOnboarding}
      profileHref="/dashboard/pilot/profile"
      allowedPrefixes={ALLOWED_WITHOUT_ONBOARDING}
      exactAllowedPaths={EXACT_ALLOWED}
      roleLabel="pilot"
    />
  );
}
