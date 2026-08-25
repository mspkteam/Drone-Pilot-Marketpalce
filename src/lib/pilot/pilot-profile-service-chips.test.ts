import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { publicPilotServiceLabels } from "./pilot-profile-service-chips";

describe("publicPilotServiceLabels", () => {
  it("includes extra chips that are not stored on servicesOffered", () => {
    const labels = publicPilotServiceLabels(["inspection"], ["thermal"]);
    assert.ok(labels.includes("Inspections"));
    assert.ok(labels.includes("Thermal"));
  });
});
