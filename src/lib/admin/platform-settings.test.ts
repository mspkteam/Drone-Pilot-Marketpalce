import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultGradeRates,
  normalizeGradeRates,
  parseCommissionPercent,
  resolveGradeCommissionRate,
} from "@/lib/admin/platform-settings";

describe("normalizeGradeRates", () => {
  it("returns all six grades when legacy config only had four", () => {
    const normalized = normalizeGradeRates([
      { id: "grade-a1", label: "A-1", value: "15%" },
      { id: "grade-a2", label: "A-2", value: "10%" },
      { id: "grade-a3", label: "A-3", value: "12%" },
      { id: "grade-a4", label: "A-4+", value: "8%" },
    ]);

    assert.equal(normalized.length, 6);
    assert.equal(normalized[0]?.label, "A-1");
    assert.equal(normalized[3]?.label, "A-4");
    assert.equal(normalized[3]?.value, "8%");
    assert.equal(normalized[4]?.label, "A-5");
    assert.equal(normalized[5]?.label, "A-6");
  });

  it("defaults to six A-1 through A-6 rows", () => {
    const rows = defaultGradeRates();
    assert.equal(rows.length, 6);
    assert.deepEqual(
      rows.map((row) => row.label),
      ["A-1", "A-2", "A-3", "A-4", "A-5", "A-6"],
    );
  });
});

describe("parseCommissionPercent", () => {
  it("parses percent strings and numbers", () => {
    assert.equal(parseCommissionPercent("15%"), 0.15);
    assert.equal(parseCommissionPercent("7.5"), 0.075);
  });
});

describe("resolveGradeCommissionRate", () => {
  it("resolves by grade label", () => {
    const rate = resolveGradeCommissionRate(
      defaultGradeRates().map((row, index) =>
        index === 5 ? { ...row, value: "12%" } : row,
      ),
      "A-6",
    );
    assert.equal(rate, 0.12);
  });
});
