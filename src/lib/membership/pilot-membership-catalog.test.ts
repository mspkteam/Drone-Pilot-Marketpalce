import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveInstructorAddonStatus } from "@/lib/membership/instructor-addon";
import {
  getUpgradeDifferenceUsd,
  isInstructorEligibleTierCode,
  PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
  PILOT_INSTRUCTOR_ADDON_FEE_USD,
  totalAtSignupUsd,
} from "@/lib/membership/pilot-membership-catalog";

describe("pilot membership catalog prices", () => {
  it("keeps genuine annual and instructor fees", () => {
    assert.equal(PILOT_ANNUAL_MEMBERSHIP_FEE_USD, 99.99);
    assert.equal(PILOT_INSTRUCTOR_ADDON_FEE_USD, 199.99);
  });

  it("computes Fast Forward signup totals and upgrade difference", () => {
    assert.equal(totalAtSignupUsd(0), 99.99);
    assert.equal(totalAtSignupUsd(89.99), 189.98);
    assert.equal(
      getUpgradeDifferenceUsd("A4_SENIOR_FLIGHT_OFFICER", "A6_CAPTAIN"),
      40,
    );
  });

  it("gates instructor eligibility at A-4+", () => {
    assert.equal(isInstructorEligibleTierCode("A3_FLIGHT_OFFICER"), false);
    assert.equal(isInstructorEligibleTierCode("A4_SENIOR_FLIGHT_OFFICER"), true);
    assert.equal(isInstructorEligibleTierCode("A6_CAPTAIN"), true);
    assert.equal(isInstructorEligibleTierCode("A7_SENIOR_CAPTAIN"), true);
  });
});

describe("instructor addon status", () => {
  it("locks below A-4 and when membership is inactive", () => {
    assert.equal(
      resolveInstructorAddonStatus({
        hasActiveMembership: true,
        tierCode: "A3_FLIGHT_OFFICER",
        instructorAddonActive: false,
      }),
      "locked",
    );
    assert.equal(
      resolveInstructorAddonStatus({
        hasActiveMembership: false,
        tierCode: "A4_SENIOR_FLIGHT_OFFICER",
        instructorAddonActive: true,
      }),
      "locked",
    );
  });

  it("returns available and active for eligible pilots", () => {
    assert.equal(
      resolveInstructorAddonStatus({
        hasActiveMembership: true,
        tierCode: "A4_SENIOR_FLIGHT_OFFICER",
        instructorAddonActive: false,
      }),
      "available",
    );
    assert.equal(
      resolveInstructorAddonStatus({
        hasActiveMembership: true,
        tierCode: "A5_FIRST_OFFICER",
        instructorAddonActive: true,
      }),
      "active",
    );
  });
});
