import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeRankProgressPct } from "@/lib/pilot/rank-progress";

describe("computeRankProgressPct", () => {
  it("returns 0 with no membership period", () => {
    assert.equal(computeRankProgressPct({}), 0);
  });

  it("returns 0 on the first day of membership", () => {
    const start = new Date("2026-10-14T12:00:00.000Z");
    const end = new Date("2027-10-14T12:00:00.000Z");
    assert.equal(
      computeRankProgressPct({
        currentPeriodStart: start,
        currentPeriodEnd: end,
        now: start,
      }),
      0,
    );
  });

  it("returns a few percent after about two weeks", () => {
    const start = new Date("2026-10-01T00:00:00.000Z");
    const end = new Date("2027-10-01T00:00:00.000Z");
    const now = new Date("2026-10-15T00:00:00.000Z");
    const pct = computeRankProgressPct({
      currentPeriodStart: start,
      currentPeriodEnd: end,
      now,
    });
    assert.ok(pct >= 3 && pct <= 5, `expected ~4%, got ${pct}`);
  });
});
