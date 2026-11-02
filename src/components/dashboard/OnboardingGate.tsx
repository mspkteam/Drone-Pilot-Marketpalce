"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type OnboardingGateProps = {
  needsOnboarding: boolean;
  profileHref: string;
  allowedPrefixes: readonly string[];
  /** Paths matched by exact equality only (e.g. dashboard home). */
  exactAllowedPaths?: readonly string[];
  roleLabel: string;
};

export function OnboardingGate({
  needsOnboarding,
  profileHref,
  allowedPrefixes,
  exactAllowedPaths = [],
  roleLabel,
}: OnboardingGateProps) {
  const pathname = usePathname();
  if (!needsOnboarding) return null;

  const allowed =
    exactAllowedPaths.some((p) => pathname === p) ||
    allowedPrefixes.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
  if (allowed) return null;

  return (
    <div className="onboarding-gate" role="dialog" aria-labelledby="onboarding-gate-title">
      <div className="onboarding-gate-card">
        <h2 id="onboarding-gate-title" className="onboarding-gate-title">
          Complete your {roleLabel} profile
        </h2>
        <p className="onboarding-gate-text">
          Your dashboard is visible, but you need to finish your profile before
          using the rest of these screens.
        </p>
        <Link href={profileHref} className="ras-btn-primary">
          Complete profile
        </Link>
      </div>
    </div>
  );
}
