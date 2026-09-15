import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getManualIssueFields,
  parseManualIssueDate,
} from "@/lib/certificates/manual-issue";

describe("getManualIssueFields", () => {
  it("includes member number and award date for wings layouts", () => {
    const fields = getManualIssueFields("master-aviator-wings");
    assert.deepEqual(fields, ["memberNumber", "issuedAt"]);
  });

  it("includes grade for promotion layouts", () => {
    const fields = getManualIssueFields("certificate-of-promotion");
    assert.deepEqual(fields, ["gradeOrTitle"]);
  });

  it("includes grade and date for captain promotion", () => {
    const fields = getManualIssueFields("captain-promotion");
    assert.deepEqual(fields, ["gradeOrTitle", "issuedAt"]);
  });

  it("includes issue date for recreational wings", () => {
    const fields = getManualIssueFields("recreational-pilot-wings");
    assert.deepEqual(fields, ["issuedAt"]);
  });

  it("uses saved overlay fields only when overrides are present", () => {
    const fields = getManualIssueFields("custom", [
      { field: "pilotName" },
      { field: "certificateNumber" },
    ]);
    assert.deepEqual(fields, []);
  });

  it("requires grade when saved overlays include gradeOrTitle", () => {
    const fields = getManualIssueFields("custom", [
      { field: "pilotName" },
      { field: "gradeOrTitle" },
      { field: "certificateNumber" },
    ]);
    assert.deepEqual(fields, ["gradeOrTitle"]);
  });
});

describe("parseManualIssueDate", () => {
  it("parses ISO date strings in local time", () => {
    const date = parseManualIssueDate("2026-07-27");
    assert.ok(date);
    assert.equal(date!.getFullYear(), 2026);
    assert.equal(date!.getMonth(), 6);
    assert.equal(date!.getDate(), 27);
  });

  it("returns null for empty input", () => {
    assert.equal(parseManualIssueDate(""), null);
  });
});
