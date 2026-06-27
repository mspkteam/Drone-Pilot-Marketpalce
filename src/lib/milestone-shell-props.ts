import {
  canBypassMilestoneLock,
  getActiveMilestone,
} from "@/lib/milestone-access";
import type { UserRole } from "@/types/roles";

/** Server-side props for DashboardShell milestone gating. */
export function getMilestoneShellProps(role: UserRole | undefined) {
  return {
    activeMilestone: getActiveMilestone(),
    milestonePreviewEnabled: canBypassMilestoneLock(role),
    userRole: role,
  };
}
