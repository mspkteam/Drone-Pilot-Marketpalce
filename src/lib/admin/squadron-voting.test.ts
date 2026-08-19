import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatBallotTimeLeft,
  formatVoteDisplayId,
  majorityRecommendation,
  SQUADRON_BALLOT_WINDOW_MS,
  tallySquadronSides,
} from "@/lib/admin/squadron-voting";

describe("squadron voting helpers", () => {
  it("formats a VOTE display id from the ballot cuid tail", () => {
    assert.equal(formatVoteDisplayId("cmballot221xyz"), "VOTE-XYZ");
  });

  it("maps approve/reject to client vs pilot sides", () => {
    const tallies = tallySquadronSides([
      { userId: "a", vote: "approve", votedAt: "" },
      { userId: "b", vote: "approve", votedAt: "" },
      { userId: "c", vote: "reject", votedAt: "" },
      { userId: "d", vote: "abstain", votedAt: "" },
    ]);
    assert.deepEqual(tallies, {
      clientVotes: 2,
      pilotVotes: 1,
      abstainVotes: 1,
    });
  });

  it("marks ballots under 12 hours as urgent", () => {
    const openedAt = new Date(Date.now() - (SQUADRON_BALLOT_WINDOW_MS - 6 * 60 * 60 * 1000));
    const time = formatBallotTimeLeft(openedAt, "open");
    assert.equal(time.urgent, true);
    assert.match(time.label, /H LEFT$/);
  });

  it("builds a majority close-early recommendation", () => {
    const text = majorityRecommendation({
      clientVotes: 14,
      pilotVotes: 9,
      clientName: "Harbor Co",
      pilotName: "Sky Pilot",
    });
    assert.match(text, /client/);
    assert.match(text, /Harbor Co/);
    assert.match(text, /14–9/);
  });
});
