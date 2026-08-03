import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  WING_CONDITION_CATALOG,
  formatAverageRatingTenths,
  getWingConditionDefinition,
  listSelectableWingConditions,
  membershipTierRank,
} from "@/lib/wings/conditions";
import { WING_AUTO_RULES } from "@/types/wing";

describe("wing award conditions catalog", () => {
  it("covers every WingAutoRule exactly once", () => {
    const catalogRules = WING_CONDITION_CATALOG.map((c) => c.rule).sort();
    const typeRules = [...WING_AUTO_RULES].sort();
    assert.deepEqual(catalogRules, typeRules);
  });

  it("exposes selectable platform conditions for the admin create form", () => {
    const selectable = listSelectableWingConditions();
    assert.ok(selectable.length >= 10);
    assert.ok(selectable.every((c) => c.rule !== "manual_only"));
    assert.ok(
      selectable.some((c) => c.rule === "membership_tier_min"),
      "membership grade condition required",
    );
    assert.ok(
      selectable.some((c) => c.rule === "has_certificate_template"),
      "certificate template condition required",
    );
  });

  it("ranks membership tiers A-1 through A-6", () => {
    assert.equal(membershipTierRank("A1_STUDENT"), 1);
    assert.equal(membershipTierRank("A6_CAPTAIN"), 6);
    assert.equal(membershipTierRank("A10_COMMODORE"), 10);
    assert.ok(
      membershipTierRank("A4_SENIOR_FLIGHT_OFFICER") >
        membershipTierRank("A2_JUNIOR_FLIGHT_OFFICER"),
    );
  });

  it("formats average rating tenths for admin preview", () => {
    assert.equal(formatAverageRatingTenths(45), "4.5★");
    assert.equal(
      getWingConditionDefinition("average_rating_min")?.field,
      "average_rating_tenths",
    );
  });
});
