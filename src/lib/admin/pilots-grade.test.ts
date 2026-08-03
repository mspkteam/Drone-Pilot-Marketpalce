import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_ASSIGNABLE_TIER_CODES,
  HONORARY_GRADE_OPTIONS,
  HONORARY_TIER_CODES,
  canAssignGradeCode,
  resolveAdminAssignableTierCode,
  resolveAnyAdminGradeTierCode,
} from "@/lib/admin/pilot-grades";

describe("admin manual grade promote", () => {
  it("exposes A-1 through A-6 assignable codes", () => {
    assert.deepEqual(ADMIN_ASSIGNABLE_TIER_CODES, [
      "A1_STUDENT",
      "A2_JUNIOR_FLIGHT_OFFICER",
      "A3_FLIGHT_OFFICER",
      "A4_SENIOR_FLIGHT_OFFICER",
      "A5_FIRST_OFFICER",
      "A6_CAPTAIN",
    ]);
  });

  it("exposes honorary A-7–A-10 tier codes", () => {
    assert.deepEqual(HONORARY_TIER_CODES, [
      "A7_SENIOR_CAPTAIN",
      "A8_MASTER_CAPTAIN",
      "A9_FLEET_CAPTAIN",
      "A10_COMMODORE",
    ]);
  });

  it("resolves DB codes and pricing labels for live grades", () => {
    assert.equal(
      resolveAdminAssignableTierCode("A4_SENIOR_FLIGHT_OFFICER"),
      "A4_SENIOR_FLIGHT_OFFICER",
    );
    assert.equal(
      resolveAdminAssignableTierCode("A-4"),
      "A4_SENIOR_FLIGHT_OFFICER",
    );
    assert.equal(resolveAdminAssignableTierCode("a-6"), "A6_CAPTAIN");
  });

  it("rejects honorary codes from live-only resolver", () => {
    assert.equal(resolveAdminAssignableTierCode("A-7"), null);
    assert.equal(resolveAdminAssignableTierCode("A-10"), null);
    assert.equal(resolveAdminAssignableTierCode("COMMODORE"), null);
    assert.equal(resolveAdminAssignableTierCode(""), null);
  });

  it("resolves honorary grades via any-grade resolver", () => {
    assert.equal(resolveAnyAdminGradeTierCode("A-7"), "A7_SENIOR_CAPTAIN");
    assert.equal(resolveAnyAdminGradeTierCode("A10_COMMODORE"), "A10_COMMODORE");
  });

  it("restricts honorary assign to super_admin", () => {
    assert.equal(canAssignGradeCode("admin", "A6_CAPTAIN"), true);
    assert.equal(canAssignGradeCode("moderator", "A4_SENIOR_FLIGHT_OFFICER"), true);
    assert.equal(canAssignGradeCode("admin", "A7_SENIOR_CAPTAIN"), false);
    assert.equal(canAssignGradeCode("moderator", "A10_COMMODORE"), false);
    assert.equal(canAssignGradeCode("super_admin", "A7_SENIOR_CAPTAIN"), true);
    assert.equal(canAssignGradeCode("super_admin", "A10_COMMODORE"), true);
  });

  it("lists honorary options for UI", () => {
    assert.equal(HONORARY_GRADE_OPTIONS.length, 4);
    assert.equal(HONORARY_GRADE_OPTIONS[0].pricingCode, "A-7");
    assert.equal(HONORARY_GRADE_OPTIONS[0].tierCode, "A7_SENIOR_CAPTAIN");
    assert.equal(HONORARY_GRADE_OPTIONS[3].pricingCode, "A-10");
  });
});
