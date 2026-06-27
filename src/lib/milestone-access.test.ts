import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  canBypassMilestoneLock,
  evaluateMilestoneAccess,
  getActiveMilestone,
  getRouteMilestone,
  isMilestoneUnlocked,
  isNavHrefLocked,
  isPublicDashboardPath,
} from "@/lib/milestone-access";

const ENV_KEYS = [
  "MILESTONE_ACTIVE",
  "NEXT_PUBLIC_MILESTONE_ACTIVE",
  "ALLOW_MILESTONE_PREVIEW",
  "NEXT_PUBLIC_ALLOW_MILESTONE_PREVIEW",
] as const;

const savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> =
  {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
});

describe("milestone access", () => {
  it("defaults to milestone 3", () => {
    assert.equal(getActiveMilestone(), 3);
  });

  it("respects NEXT_PUBLIC_MILESTONE_ACTIVE override", () => {
    process.env.NEXT_PUBLIC_MILESTONE_ACTIVE = "3";
    assert.equal(getActiveMilestone(), 3);
    assert.equal(isMilestoneUnlocked(2), true);
    assert.equal(isMilestoneUnlocked(4), false);
  });

  it("ignores invalid milestone env values", () => {
    process.env.MILESTONE_ACTIVE = "99";
    assert.equal(getActiveMilestone(), 3);
  });

  it("treats marketing paths as public", () => {
    assert.equal(isPublicDashboardPath("/"), true);
    assert.equal(isPublicDashboardPath("/login"), true);
    assert.equal(isPublicDashboardPath("/dashboard/client"), false);
  });

  it("unlocks week 1 client routes at milestone 3", () => {
    const access = evaluateMilestoneAccess("/dashboard/client/jobs", "client");
    assert.equal(access.allowed, true);
    assert.equal(access.match?.rule.featureKey, "client.my-projects");
  });

  it("unlocks admin routes at milestone 3", () => {
    const access = evaluateMilestoneAccess("/dashboard/admin", "moderator");
    assert.equal(access.allowed, true);
    assert.equal(access.requiredMilestone, 2);
  });

  it("locks admin routes when milestone env is 1", () => {
    process.env.NEXT_PUBLIC_MILESTONE_ACTIVE = "1";
    const access = evaluateMilestoneAccess("/dashboard/admin", "moderator");
    assert.equal(access.allowed, false);
    assert.equal(access.requiredMilestone, 2);
  });

  it("unlocks pilot marketplace at milestone 3", () => {
    const access = evaluateMilestoneAccess("/dashboard/pilot/jobs", "pilot");
    assert.equal(access.allowed, true);
    assert.equal(access.requiredMilestone, 3);
  });

  it("locks pilot marketplace when milestone env is 2", () => {
    process.env.NEXT_PUBLIC_MILESTONE_ACTIVE = "2";
    const access = evaluateMilestoneAccess("/dashboard/pilot/jobs", "pilot");
    assert.equal(access.allowed, false);
    assert.equal(access.requiredMilestone, 3);
  });

  it("keeps client onboarding always unlocked", () => {
    const access = evaluateMilestoneAccess(
      "/dashboard/client/onboarding",
      "client",
    );
    assert.equal(access.allowed, true);
    assert.equal(access.match?.rule.alwaysUnlocked, true);
  });

  it("prefers longest path prefix for nested client job routes", () => {
    const newJob = getRouteMilestone("/dashboard/client/jobs/new");
    const list = getRouteMilestone("/dashboard/client/jobs");
    assert.equal(newJob?.rule.featureKey, "client.post-project");
    assert.equal(list?.rule.featureKey, "client.my-projects");
  });

  it("marks locked nav hrefs for future milestones", () => {
    assert.equal(isNavHrefLocked("/dashboard/pilot/jobs"), false);
    assert.equal(isNavHrefLocked("/dashboard/admin"), false);
    assert.equal(isNavHrefLocked("/dashboard/client/jobs"), false);
  });

  it("allows admin bypass only with preview flag", () => {
    assert.equal(canBypassMilestoneLock("super_admin"), false);

    process.env.ALLOW_MILESTONE_PREVIEW = "true";
    assert.equal(canBypassMilestoneLock("super_admin"), true);
    assert.equal(canBypassMilestoneLock("client"), false);
    assert.equal(canBypassMilestoneLock(undefined), false);
  });

  it("bypasses milestone lock for admin preview", () => {
    process.env.ALLOW_MILESTONE_PREVIEW = "true";
    const access = evaluateMilestoneAccess("/dashboard/admin", "super_admin");
    assert.equal(access.allowed, true);
    assert.equal(access.bypassed, true);
  });
});
