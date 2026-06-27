import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canApproveJob,
  canRejectJob,
} from "@/lib/jobs/status";
import {
  canPilotViewJob,
  computeJobVisibleAt,
} from "@/lib/membership/membership";
import { MEMBERSHIP_TIER_DEFINITIONS } from "@/lib/membership/tiers";
import type { MembershipTierDto } from "@/types/membership";

function tierFromCode(code: string): MembershipTierDto {
  const def = MEMBERSHIP_TIER_DEFINITIONS.find((t) => t.code === code)!;
  return {
    id: code,
    code: def.code,
    name: def.name,
    slug: def.slug,
    priceYearly: def.priceYearly,
    priceMonthly: def.priceYearly / 12,
    currency: "USD",
    jobVisibilityDelayHours: def.jobVisibilityDelayHours,
    canViewJobs: def.canViewJobs,
    canApply: def.canApply,
    instructorEligible: def.instructorEligible,
    sortOrder: def.sortOrder,
    features: def.features,
    isActive: true,
  };
}

describe("admin job approval workflow", () => {
  it("allows approve and reject only while pending approval", () => {
    assert.equal(canApproveJob("pending_approval"), true);
    assert.equal(canRejectJob("pending_approval"), true);
    assert.equal(canApproveJob("open"), false);
    assert.equal(canRejectJob("open"), false);
    assert.equal(canApproveJob("draft"), false);
    assert.equal(canRejectJob("assigned"), false);
  });

  it("starts tier visibility clock from approvedAt after approval", () => {
    const approvedAt = new Date("2026-06-01T12:00:00.000Z");
    const openJob = { status: "open" as const, approvedAt };

    const a1 = tierFromCode("A1_STUDENT");
    const beforeDelay = new Date("2026-06-03T11:59:00.000Z");
    const afterDelay = new Date("2026-06-03T12:00:00.000Z");

    assert.equal(canPilotViewJob(a1, openJob, beforeDelay), false);
    assert.equal(canPilotViewJob(a1, openJob, afterDelay), true);
    assert.equal(
      computeJobVisibleAt(approvedAt, a1.jobVisibilityDelayHours).toISOString(),
      afterDelay.toISOString(),
    );
  });

  it("does not expose jobs before admin approval", () => {
    const captain = tierFromCode("A6_CAPTAIN");
    assert.equal(
      canPilotViewJob(
        captain,
        { status: "pending_approval", approvedAt: null },
        new Date(),
      ),
      false,
    );
  });
});
