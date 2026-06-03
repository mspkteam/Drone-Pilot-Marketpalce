"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ALLOWED_WITHOUT_ONBOARDING = [
  "/dashboard/pilot/onboarding",
  "/dashboard/pilot/settings",
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
      router.replace("/dashboard/pilot/onboarding");
    }
  }, [needsOnboarding, pathname, router]);

  return null;
}
