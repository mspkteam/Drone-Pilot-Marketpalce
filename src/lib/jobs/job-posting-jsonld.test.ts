import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildJobPostingJsonLd } from "./job-posting-jsonld";

describe("JobPosting JSON-LD", () => {
  it("builds Google Jobs compatible payload", () => {
    const json = buildJobPostingJsonLd(
      {
        id: "job_123",
        title: "Roof inspection — downtown",
        description: "Capture orthomosaic of commercial roof.",
        category: "inspection",
        locationLabel: "Austin, TX",
        locationCity: "Austin",
        locationRegion: "TX",
        locationCountry: "US",
        budgetMin: 400,
        budgetMax: 600,
        currency: "USD",
        requirements: "Part 107",
        scheduledDate: new Date("2026-08-01"),
        approvedAt: new Date("2026-07-20"),
        createdAt: new Date("2026-07-19"),
        updatedAt: new Date("2026-07-20"),
        clientProfile: {
          companyName: "Acme Roofing",
          contactName: "Jane Client",
        },
      },
      { origin: "https://example.com" },
    );

    assert.equal(json["@type"], "JobPosting");
    assert.equal(json.title, "Roof inspection — downtown");
    assert.equal(json.url, "https://example.com/jobs/job_123");
    assert.equal(json.employmentType, "CONTRACTOR");
    assert.equal(
      (json.hiringOrganization as { name: string }).name,
      "Acme Roofing",
    );
    assert.match(String(json.description), /Part 107/);
  });
});
