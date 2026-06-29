import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getFastForwardFeeUsd,
  getUpgradeDifferenceUsd,
  PILOT_ANNUAL_MEMBERSHIP_FEE_USD,
  totalAtSignupUsd,
} from "@/lib/membership/pilot-membership-catalog";

describe("pilot-membership-catalog", () => {
  it("uses $99.99 annual base fee", () => {
    assert.equal(PILOT_ANNUAL_MEMBERSHIP_FEE_USD, 99.99);
  });

  it("calculates signup totals from annual + fast forward fee", () => {
    assert.equal(totalAtSignupUsd(89.99), 189.98);
    assert.equal(totalAtSignupUsd(0), 99.99);
  });

  it("exposes fast forward fees per grade", () => {
    assert.equal(getFastForwardFeeUsd("A1_STUDENT"), 0);
    assert.equal(getFastForwardFeeUsd("A4_SENIOR_FLIGHT_OFFICER"), 89.99);
    assert.equal(getFastForwardFeeUsd("A6_CAPTAIN"), 129.99);
  });

  it("calculates upgrade difference only for higher tiers", () => {
    assert.equal(
      getUpgradeDifferenceUsd(
        "A4_SENIOR_FLIGHT_OFFICER",
        "A6_CAPTAIN",
      ),
      40,
    );
    assert.equal(
      getUpgradeDifferenceUsd("A1_STUDENT", "A2_JUNIOR_FLIGHT_OFFICER"),
      49.99,
    );
    assert.equal(
      getUpgradeDifferenceUsd("A6_CAPTAIN", "A4_SENIOR_FLIGHT_OFFICER"),
      0,
    );
  });
});
