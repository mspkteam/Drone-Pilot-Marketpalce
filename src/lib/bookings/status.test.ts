import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAvailableBookingActions } from "@/lib/bookings/status";

describe("booking delivery workflow", () => {
  it("routes completion through deliverable approval instead of direct mark complete", () => {
    const pilotActions = getAvailableBookingActions("pilot", "in_progress");
    assert.equal(
      pilotActions.some((action) => action.action === "completed"),
      false,
    );

    const clientActions = getAvailableBookingActions("client", "in_progress");
    assert.equal(
      clientActions.some((action) => action.action === "completed"),
      false,
    );
  });

  it("keeps start work and confirm actions available", () => {
    assert.deepEqual(
      getAvailableBookingActions("pilot", "confirmed").map((action) => action.action),
      ["in_progress", "cancelled"],
    );
    assert.deepEqual(
      getAvailableBookingActions("client", "pending").map((action) => action.action),
      ["confirmed", "cancelled"],
    );
  });
});
