import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pilotMeetsProductEligibility } from "./eligibility";

describe("shop product eligibility", () => {
  it("allows open products", () => {
    assert.equal(
      pilotMeetsProductEligibility(
        { minTierCode: null, exactTierCode: null, requiredWingCode: null },
        { tierCode: "A1_STUDENT", wingCodes: new Set() },
      ),
      true,
    );
  });

  it("enforces minimum grade for Captain polo", () => {
    assert.equal(
      pilotMeetsProductEligibility(
        {
          minTierCode: "A6_CAPTAIN",
          exactTierCode: null,
          requiredWingCode: null,
        },
        { tierCode: "A5_FIRST_OFFICER", wingCodes: new Set() },
      ),
      false,
    );
    assert.equal(
      pilotMeetsProductEligibility(
        {
          minTierCode: "A6_CAPTAIN",
          exactTierCode: null,
          requiredWingCode: null,
        },
        { tierCode: "A6_CAPTAIN", wingCodes: new Set() },
      ),
      true,
    );
  });

  it("enforces exact grade for epaulettes", () => {
    assert.equal(
      pilotMeetsProductEligibility(
        {
          minTierCode: null,
          exactTierCode: "A3_FLIGHT_OFFICER",
          requiredWingCode: null,
        },
        { tierCode: "A4_SENIOR_FLIGHT_OFFICER", wingCodes: new Set() },
      ),
      false,
    );
    assert.equal(
      pilotMeetsProductEligibility(
        {
          minTierCode: null,
          exactTierCode: "A3_FLIGHT_OFFICER",
          requiredWingCode: null,
        },
        { tierCode: "A3_FLIGHT_OFFICER", wingCodes: new Set() },
      ),
      true,
    );
  });

  it("requires awarded wing code", () => {
    assert.equal(
      pilotMeetsProductEligibility(
        {
          minTierCode: null,
          exactTierCode: null,
          requiredWingCode: "aviator-wings-senior",
        },
        { tierCode: "A6_CAPTAIN", wingCodes: new Set(["aviator-wings-basic-gold"]) },
      ),
      false,
    );
    assert.equal(
      pilotMeetsProductEligibility(
        {
          minTierCode: null,
          exactTierCode: null,
          requiredWingCode: "aviator-wings-senior",
        },
        {
          tierCode: "A6_CAPTAIN",
          wingCodes: new Set(["aviator-wings-senior"]),
        },
      ),
      true,
    );
  });
});
