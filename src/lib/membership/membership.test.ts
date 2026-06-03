import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MEMBERSHIP_TIER_DEFINITIONS } from "@/lib/membership/tiers";
import {
  canPilotApplyToJob,
  canPilotViewJob,
  computeJobVisibleAt,
  isJobVisibleNow,
} from "@/lib/membership/membership";
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

const approvedAt = new Date("2026-06-01T12:00:00.000Z");

function openJob(approved = approvedAt) {
  return { status: "open" as const, approvedAt: approved };
}

describe("membership job visibility", () => {
  it("A-6 Captain sees jobs immediately", () => {
    const tier = tierFromCode("A6_CAPTAIN");
    const now = new Date("2026-06-01T12:00:01.000Z");
    assert.equal(canPilotViewJob(tier, openJob(), now), true);
    assert.equal(canPilotApplyToJob(tier, openJob(), now), true);
  });

  it("A-5 First Officer sees jobs after 6 hours", () => {
    const tier = tierFromCode("A5_FIRST_OFFICER");
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-01T17:59:00.000Z")),
      false,
    );
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-01T18:00:00.000Z")),
      true,
    );
  });

  it("A-4 Senior Flight Officer sees jobs after 12 hours", () => {
    const tier = tierFromCode("A4_SENIOR_FLIGHT_OFFICER");
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-01T23:59:00.000Z")),
      false,
    );
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-02T00:00:00.000Z")),
      true,
    );
  });

  it("A-3 Flight Officer sees jobs after 24 hours", () => {
    const tier = tierFromCode("A3_FLIGHT_OFFICER");
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-02T11:59:00.000Z")),
      false,
    );
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-02T12:00:00.000Z")),
      true,
    );
  });

  it("A-2 Junior Flight Officer sees jobs after 36 hours", () => {
    const tier = tierFromCode("A2_JUNIOR_FLIGHT_OFFICER");
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-02T23:59:00.000Z")),
      false,
    );
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-03T00:00:00.000Z")),
      true,
    );
  });

  it("A-1 Student sees jobs after 48 hours", () => {
    const tier = tierFromCode("A1_STUDENT");
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-03T11:59:00.000Z")),
      false,
    );
    assert.equal(
      canPilotViewJob(tier, openJob(), new Date("2026-06-03T12:00:00.000Z")),
      true,
    );
  });

  it("A-1 Student cannot submit a bid after job is visible", () => {
    const tier = tierFromCode("A1_STUDENT");
    const now = new Date("2026-06-03T12:00:00.000Z");
    assert.equal(canPilotViewJob(tier, openJob(), now), true);
    assert.equal(canPilotApplyToJob(tier, openJob(), now), false);
  });

  it("A-2 and above can bid only after visibility delay", () => {
    const tier = tierFromCode("A2_JUNIOR_FLIGHT_OFFICER");
    assert.equal(
      canPilotApplyToJob(tier, openJob(), new Date("2026-06-02T23:59:00.000Z")),
      false,
    );
    assert.equal(
      canPilotApplyToJob(tier, openJob(), new Date("2026-06-03T00:00:00.000Z")),
      true,
    );
  });

  it("unapproved jobs are never visible", () => {
    const tier = tierFromCode("A6_CAPTAIN");
    assert.equal(
      canPilotViewJob(tier, { status: "open", approvedAt: null }, new Date()),
      false,
    );
    assert.equal(
      canPilotViewJob(tier, { status: "pending_approval", approvedAt }, new Date()),
      false,
    );
  });

  it("jobs without approvedAt are not visible", () => {
    const tier = tierFromCode("A6_CAPTAIN");
    assert.equal(isJobVisibleNow(null, 0), false);
    assert.equal(
      canPilotViewJob(tier, { status: "open", approvedAt: null }),
      false,
    );
  });

  it("computeJobVisibleAt adds delay hours", () => {
    const visibleAt = computeJobVisibleAt(approvedAt, 48);
    assert.equal(visibleAt.toISOString(), "2026-06-03T12:00:00.000Z");
  });
});
