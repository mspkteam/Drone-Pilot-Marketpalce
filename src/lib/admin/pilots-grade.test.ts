import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_ASSIGNABLE_TIER_CODES,
  HONORARY_GRADE_OPTIONS,
  resolveAdminAssignableTierCode,
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

  it("resolves DB codes and pricing labels", () => {
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

  it("rejects honorary A-7–A-10 and junk", () => {
    assert.equal(resolveAdminAssignableTierCode("A-7"), null);
    assert.equal(resolveAdminAssignableTierCode("A-10"), null);
    assert.equal(resolveAdminAssignableTierCode("COMMODORE"), null);
    assert.equal(resolveAdminAssignableTierCode(""), null);
  });

  it("lists honorary options for UI only", () => {
    assert.equal(HONORARY_GRADE_OPTIONS.length, 4);
    assert.equal(HONORARY_GRADE_OPTIONS[0].pricingCode, "A-7");
    assert.equal(HONORARY_GRADE_OPTIONS[3].pricingCode, "A-10");
  });
});
