import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterClientMyProjects,
  formatClientProjectBudget,
  formatClientProjectPostedLabel,
  jobToClientMyProject,
  type ClientMyProject,
} from "@/lib/client/my-projects";

function sampleProject(
  overrides: Partial<ClientMyProject> = {},
): ClientMyProject {
  return {
    id: "job-1",
    title: "Roof inspection",
    location: "Austin, TX",
    postedLabel: "Posted yesterday",
    bidsCount: 2,
    budget: "$500 - $800",
    status: "Open",
    badgeTone: "gold",
    jobStatus: "open",
    ...overrides,
  };
}

describe("client my projects", () => {
  it("filters projects by tab", () => {
    const projects = [
      sampleProject({ id: "1", jobStatus: "open" }),
      sampleProject({ id: "2", jobStatus: "assigned" }),
      sampleProject({ id: "3", jobStatus: "closed" }),
      sampleProject({ id: "4", jobStatus: "draft" }),
    ];

    assert.equal(filterClientMyProjects(projects, "all").length, 4);
    assert.equal(filterClientMyProjects(projects, "awaiting-bids").length, 1);
    assert.equal(filterClientMyProjects(projects, "in-progress").length, 1);
    assert.equal(filterClientMyProjects(projects, "completed").length, 1);
    assert.equal(filterClientMyProjects(projects, "pending").length, 1);
  });

  it("formats budget ranges", () => {
    assert.equal(
      formatClientProjectBudget({
        budgetMin: 500,
        budgetMax: 800,
        currency: "USD",
      }),
      "$500 - $800",
    );
    assert.equal(
      formatClientProjectBudget({
        budgetMin: null,
        budgetMax: 1200,
        currency: "USD",
      }),
      "Up to $1,200",
    );
    assert.equal(
      formatClientProjectBudget({
        budgetMin: null,
        budgetMax: null,
        currency: "USD",
      }),
      "Budget TBD",
    );
  });

  it("formats relative posted labels", () => {
    const recent = new Date(Date.now() - 5 * 60_000).toISOString();
    assert.match(formatClientProjectPostedLabel(recent), /Posted \d+ minutes? ago/);
  });

  it("maps job records to card view models", () => {
    const mapped = jobToClientMyProject({
      id: "job-99",
      title: "Solar survey",
      locationLabel: "Denver, CO",
      budgetMin: 1000,
      budgetMax: 1500,
      currency: "USD",
      status: "open",
      submittedAt: new Date("2026-06-01T12:00:00.000Z"),
      createdAt: new Date("2026-06-01T10:00:00.000Z"),
      _count: { applications: 3 },
    });

    assert.equal(mapped.id, "job-99");
    assert.equal(mapped.bidsCount, 3);
    assert.equal(mapped.budget, "$1,000 - $1,500");
    assert.equal(mapped.jobStatus, "open");
  });
});
