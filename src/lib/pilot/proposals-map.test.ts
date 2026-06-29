import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mapApplicationStatusToUi,
  proposalBadgeLabel,
} from "@/lib/pilot/proposals-map";

describe("pilot proposals map", () => {
  it("maps shortlisted submitted applications to Revised tab", () => {
    assert.equal(
      mapApplicationStatusToUi("submitted", "2026-06-01T12:00:00.000Z"),
      "REVISED",
    );
    assert.equal(proposalBadgeLabel("REVISED"), "Shortlisted");
  });

  it("keeps unsubmitted applications in Pending tab", () => {
    assert.equal(mapApplicationStatusToUi("submitted", null), "PENDING");
    assert.equal(proposalBadgeLabel("PENDING"), "Pending");
  });
});
