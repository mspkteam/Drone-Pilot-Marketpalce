import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateApplicationInput } from "@/lib/applications/validation";

const validBase = {
  message: "I can complete this mission with my enterprise drone fleet.",
  estimatedDeliveryDate: "2026-07-01",
  estimatedDurationAmount: 2,
  estimatedDurationUnit: "days" as const,
  deliverables: ["Photos", "Video"],
  accuracyConfirmed: true,
  operationalPlan: {
    projectedMileage: "120 miles round trip",
    flightTimeEstimate: "4.5 hours",
    numberOfFlights: 2,
    droneEquipment: "DJI Mavic 3 Enterprise",
    groundSupport: "4x4 vehicle",
    crewCount: 2,
  },
  compliance: {
    permitsWaivers: "Airspace waiver required",
    travelLodging: "Travel required, lodging not included",
    safetyPlan: "Pre-flight weather check and obstacle assessment",
  },
  pricingBreakdown: {
    flightOperations: 800,
    travelMileage: 150,
    equipmentBatteries: 100,
    planningDelivery: 150,
  },
};

describe("validateApplicationInput", () => {
  it("accepts a complete extended proposal payload", () => {
    const result = validateApplicationInput(validBase);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.proposedAmount, 1200);
    assert.equal(result.data.proposalDetails?.availability, "2 days");
    assert.equal(result.data.proposalDetails?.pricingBreakdown?.flightOperations, 800);
  });

  it("rejects when pricing total does not match proposed amount", () => {
    const result = validateApplicationInput({
      ...validBase,
      proposedAmount: 900,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /match the pricing breakdown total/i);
  });

  it("requires accuracy confirmation", () => {
    const result = validateApplicationInput({
      ...validBase,
      accuracyConfirmed: false,
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /accuracy and compliance/i);
  });

  it("requires operational plan fields", () => {
    const result = validateApplicationInput({
      ...validBase,
      operationalPlan: { projectedMileage: "", flightTimeEstimate: "", droneEquipment: "" },
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /operational plan/i);
  });
});
