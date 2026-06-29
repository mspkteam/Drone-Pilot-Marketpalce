import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPortfolioItem,
  parsePortfolioJson,
  parsePortfolioTags,
  portfolioStrengthLabel,
  portfolioStrengthStatus,
  serializePortfolioJson,
} from "./portfolio";

describe("portfolio", () => {
  it("parses portfolio tags", () => {
    assert.deepEqual(parsePortfolioTags("thermal, inspection "), ["THERMAL", "INSPECTION"]);
  });

  it("round-trips portfolio JSON", () => {
    const item = createPortfolioItem({
      type: "VIDEO",
      title: "Tower scan",
      tags: ["INSPECTION"],
      thumbnailUrl: null,
    });
    const raw = serializePortfolioJson([item]);
    const parsed = parsePortfolioJson(raw);
    assert.equal(parsed.length, 1);
    assert.equal(parsed[0]!.title, "Tower scan");
  });

  it("computes portfolio strength", () => {
    assert.equal(portfolioStrengthStatus(0), "missing");
    assert.equal(portfolioStrengthStatus(3), "partial");
    assert.equal(portfolioStrengthStatus(8), "done");
    assert.equal(portfolioStrengthLabel(3), "Portfolio (3/8)");
  });
});
