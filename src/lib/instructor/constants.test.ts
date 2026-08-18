import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInstructorDiscountCode,
  instructorMembershipDiscountUsd,
  isInstructorAwardableWingCode,
  isStudentUniformDiscountItem,
  normalizeInstructorDiscountCode,
  studentUniformDiscountUsd,
} from "@/lib/instructor/constants";
import { PILOT_ANNUAL_MEMBERSHIP_FEE_USD } from "@/lib/membership/pilot-membership-catalog";
import { isInstructorEligibleTierCode } from "@/lib/membership/pilot-membership-catalog";

describe("instructor discount helpers", () => {
  it("takes 20% off basic membership only", () => {
    assert.equal(instructorMembershipDiscountUsd(PILOT_ANNUAL_MEMBERSHIP_FEE_USD), 20);
    assert.equal(PILOT_ANNUAL_MEMBERSHIP_FEE_USD - 20, 79.99);
  });

  it("builds and normalizes instructor codes", () => {
    assert.equal(buildInstructorDiscountCode("Jane Doe"), "INSTRUCTOR-JD20");
    assert.equal(normalizeInstructorDiscountCode(" instructor-jd20 "), "INSTRUCTOR-JD20");
  });

  it("limits instructor-awardable wings", () => {
    assert.equal(isInstructorAwardableWingCode("aviator-wings-basic-gold"), true);
    assert.equal(isInstructorAwardableWingCode("aviator-wings-basic-silver"), true);
    assert.equal(isInstructorAwardableWingCode("master-aviator-wings"), false);
  });

  it("applies 15% off student epaulettes and wings", () => {
    assert.equal(studentUniformDiscountUsd(100), 15);
    assert.equal(
      isStudentUniformDiscountItem({
        name: "Student Epaulettes",
        slug: "student-epaulettes",
        requiredWingCode: null,
      }),
      true,
    );
    assert.equal(
      isStudentUniformDiscountItem({
        name: "Captain Polo",
        slug: "captain-polo",
        requiredWingCode: null,
      }),
      false,
    );
  });
});

describe("instructor eligibility honorary grades", () => {
  it("treats honorary A-7+ as instructor eligible", () => {
    assert.equal(isInstructorEligibleTierCode("A7_SENIOR_CAPTAIN"), true);
  });
});
