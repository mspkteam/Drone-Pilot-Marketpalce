import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractPostProjectMetadata, parseJobPostProjectMetadata } from "@/lib/jobs/post-project-metadata";
import { initialPostProjectFormState } from "@/lib/client/post-project";

describe("job post-project metadata", () => {
  it("round-trips wizard metadata through JSON storage", () => {
    const form = {
      ...initialPostProjectFormState(),
      serviceId: "roof_inspection" as const,
      deliverables: ["Photos", "Inspection Report"] as const,
      quoteType: "fixed_budget" as const,
      priority: "urgent" as const,
      budgetMin: "800",
      budgetMax: "1200",
      coverTravelExpenses: true,
      travelExpenses: {
        airTravel: "500",
        lodging: "300",
        incidentals: "150",
        groundTransport: "100",
      },
      locations: [
        { address: "123 Main St", city: "Austin", country: "United States", state: "TX" },
      ],
      specialRequirements: "Need FAA waiver coordination.",
    };

    const metadata = extractPostProjectMetadata(form);
    const parsed = parseJobPostProjectMetadata(JSON.stringify(metadata));

    assert.deepEqual(parsed, metadata);
    assert.equal(parsed?.serviceId, "roof_inspection");
    assert.equal(parsed?.deliverables.length, 2);
    assert.equal(parsed?.travel?.coverTravelExpenses, true);
    assert.equal(parsed?.travel?.lodging, 300);
  });

  it("returns null for invalid stored metadata", () => {
    assert.equal(parseJobPostProjectMetadata("{bad json"), null);
    assert.equal(parseJobPostProjectMetadata(JSON.stringify({ serviceId: "nope" })), null);
  });

  it("migrates legacy location stateCountry into country", () => {
    const parsed = parseJobPostProjectMetadata(
      JSON.stringify({
        serviceId: "roof_inspection",
        quoteType: "fixed_budget",
        priority: "standard",
        locations: [{ address: "1 Main", city: "Austin", stateCountry: "United States" }],
        deliverables: ["Photos"],
        referenceFileNames: [],
      }),
    );

    assert.equal(parsed?.locations[0]?.country, "United States");
    assert.equal(parsed?.locations[0]?.state, "");
    assert.equal(parsed?.travel, null);
  });
});
