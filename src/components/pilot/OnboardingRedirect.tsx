"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ALLOWED_WITHOUT_ONBOARDING = [
  "/dashboard/pilot/profile",
  "/dashboard/pilot/onboarding",
  "/dashboard/pilot/verifications",
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
