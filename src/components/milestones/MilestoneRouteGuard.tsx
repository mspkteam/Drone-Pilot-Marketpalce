"use client";

import { usePathname } from "next/navigation";
import { MilestoneLockedScreen } from "@/components/milestones/MilestoneLockedScreen";
import {
  evaluateMilestoneAccess,
  getCurrentWeekFeaturesHref,
} from "@/lib/milestone-access";
import type { UserRole } from "@/types/roles";

type MilestoneRouteGuardProps = {
  children: React.ReactNode;
  userRole?: UserRole;
  dashboardHomeHref: string;
};

export function MilestoneRouteGuard({
  children,
  userRole,
  dashboardHomeHref,
}: MilestoneRouteGuardProps) {
  const pathname = usePathname() ?? "/";
  const access = evaluateMilestoneAccess(pathname, userRole);

  if (access.allowed || !access.match) {
    return <>{children}</>;
  }

  return (
    <MilestoneLockedScreen
      featureLabel={access.match.rule.featureLabel}
      requiredMilestone={access.match.milestone}
      dashboardHomeHref={dashboardHomeHref}
      currentWeekHref={getCurrentWeekFeaturesHref(userRole)}
      previewBypass={access.bypassed}
    />
  );
}
