import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCalendarMonth,
  formatIsoDateForDisplay,
  isoDateFromParts,
  parseIsoDate,
  todayIsoDate,
} from "./date";

describe("date format helpers", () => {
  it("formats ISO dates for display", () => {
    assert.equal(formatIsoDateForDisplay("2026-07-15"), "15/07/2026");
    assert.equal(formatIsoDateForDisplay("legacy text"), "legacy text");
  });

  it("parses valid ISO dates", () => {
    assert.deepEqual(parseIsoDate("2026-02-28"), { year: 2026, month: 2, day: 28 });
    assert.equal(parseIsoDate("2026-02-30"), null);
    assert.equal(parseIsoDate("bad"), null);
  });

  it("builds calendar month cells", () => {
    const cells = buildCalendarMonth(2026, 7);
    assert.equal(cells.length, 42);
    assert.equal(cells.some((cell) => cell.inMonth && cell.date === "2026-07-15"), true);
  });

  it("returns today in ISO format", () => {
    const today = todayIsoDate();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(isoDateFromParts(2026, 7, 9), "2026-07-09");
  });
});
