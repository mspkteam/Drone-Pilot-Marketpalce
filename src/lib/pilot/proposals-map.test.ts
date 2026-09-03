import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countProposalsByStatus,
  filterProposalsByTab,
  isProposalTabId,
  mapApplicationStatusToUi,
  proposalBadgeLabel,
} from "@/lib/pilot/proposals-map";

describe("pilot proposals map", () => {
  it("maps shortlisted submitted applications to Revised tab", () => {
    assert.equal(
      mapApplicationStatusToUi("submitted", "2026-06-01T12:00:00.000Z"),
      "REVISED",
    );
    assert.equal(proposalBadgeLabel("REVISED"), "SHORTLISTED");
  });

  it("keeps unsubmitted applications in Pending tab", () => {
    assert.equal(mapApplicationStatusToUi("submitted", null), "PENDING");
    assert.equal(proposalBadgeLabel("PENDING"), "PENDING");
  });

  it("counts and filters by tab including All", () => {
    const rows = [
      { status: "PENDING" },
      { status: "PENDING" },
      { status: "ACCEPTED" },
    ] as const;
    const mapped = rows.map((row, index) => ({
      id: String(index),
      displayId: `#${index}`,
      mission: "Mission",
      client: "Client",
      bid: "$1",
      sent: "1d ago",
      viewedLabel: "Not Viewed" as const,
      status: row.status,
      badgeLabel: row.status,
      viewHref: "/",
    }));
    const counts = countProposalsByStatus(mapped);
    assert.equal(counts.ALL, 3);
    assert.equal(counts.PENDING, 2);
    assert.equal(counts.ACCEPTED, 1);
    assert.equal(filterProposalsByTab(mapped, "PENDING").length, 2);
    assert.equal(filterProposalsByTab(mapped, "ALL").length, 3);
    assert.equal(isProposalTabId("PENDING"), true);
    assert.equal(isProposalTabId("nope"), false);
  });
});
