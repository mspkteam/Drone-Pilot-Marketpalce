"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Routes pilots may open before onboardingCompletedAt is set. */
const ALLOWED_WITHOUT_ONBOARDING = [
  "/dashboard/pilot/profile",
  "/dashboard/pilot/onboarding",
  "/dashboard/pilot/verifications",
  // Linked from Profile → Portfolio; bouncing back wiped unsaved profile fields.
  "/dashboard/pilot/portfolio",
  "/dashboard/pilot/settings",
  "/dashboard/pilot/support",
];

type OnboardingRedirectProps = {
  needsOnboarding: boolean;
};

export function OnboardingRedirect({ needsOnboarding }: OnboardingRedirectProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!needsOnboarding) return;

    const allowed = ALLOWED_WITHOUT_ONBOARDING.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );

    if (!allowed) {
      router.replace("/dashboard/pilot/profile");
    }
  }, [needsOnboarding, pathname, router]);

  return null;
}
