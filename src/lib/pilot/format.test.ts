import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPilotRateRange,
  formatServiceRadius,
  parseLanguageList,
} from "./format";

describe("pilot public format", () => {
  it("collapses equal hourly min and max", () => {
    assert.equal(formatPilotRateRange(150, 150), "$150/hr");
  });

  it("shows service radius in miles to match the dashboard", () => {
    assert.equal(formatServiceRadius(193), "120 mi");
  });

  it("parses language lists", () => {
    assert.deepEqual(parseLanguageList("English, German; Urdu"), [
      "English",
      "German",
      "Urdu",
    ]);
  });
});
