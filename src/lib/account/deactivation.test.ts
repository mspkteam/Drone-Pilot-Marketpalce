import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canReactivateAt, purgeCutoffDate } from "./deactivation";

describe("account deactivation window", () => {
  it("allows reactivation within 30 days", () => {
    const deactivatedAt = new Date("2026-08-01T00:00:00.000Z");
    const now = new Date("2026-08-20T00:00:00.000Z");
    assert.equal(canReactivateAt(deactivatedAt, now), true);
  });

  it("blocks reactivation after 30 days", () => {
    const deactivatedAt = new Date("2026-07-01T00:00:00.000Z");
    const now = new Date("2026-08-20T00:00:00.000Z");
    assert.equal(canReactivateAt(deactivatedAt, now), false);
  });

  it("purge cutoff is 30 days before now", () => {
    const now = new Date("2026-08-31T00:00:00.000Z");
    assert.equal(
      purgeCutoffDate(now).toISOString(),
      "2026-08-01T00:00:00.000Z",
    );
  });
});
