import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeAgreementEndsAt,
  computeDisputeSplit,
  DISPUTE_AGREEMENT_PERIOD_MS,
  isAgreementPeriodActive,
  isSquadronMinimumMet,
  resolveAgreementEndsAt,
  SQUADRON_MIN_VOTES,
} from "@/lib/disputes/dispute-rules";

describe("dispute agreement period", () => {
  it("ends 3 days after the dispute opens", () => {
    const opened = new Date("2026-01-01T00:00:00Z");
    assert.equal(
      computeAgreementEndsAt(opened).getTime() - opened.getTime(),
      DISPUTE_AGREEMENT_PERIOD_MS,
    );
    assert.equal(DISPUTE_AGREEMENT_PERIOD_MS, 3 * 24 * 60 * 60 * 1000);
  });

  it("blocks voting until the period ends", () => {
    const ends = new Date("2026-01-04T00:00:00Z");
    assert.equal(isAgreementPeriodActive(ends, ends.getTime() - 1), true);
    assert.equal(isAgreementPeriodActive(ends, ends.getTime()), false);
  });

  it("falls back to createdAt for legacy disputes", () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    assert.equal(
      resolveAgreementEndsAt({ agreementEndsAt: null, createdAt }).getTime(),
      computeAgreementEndsAt(createdAt).getTime(),
    );
  });
});

describe("squadron minimum votes", () => {
  it("defaults to 5", () => {
    assert.equal(SQUADRON_MIN_VOTES, 5);
    assert.equal(isSquadronMinimumMet(4), false);
    assert.equal(isSquadronMinimumMet(5), true);
  });
});

describe("computeDisputeSplit", () => {
  it("full refund returns everything to the client", () => {
    const result = computeDisputeSplit({ resolutionType: "refund", agreedAmount: 1000 });
    assert.deepEqual(result, {
      ok: true,
      split: { pilotAmount: 0, clientAmount: 1000, platformAmount: 0 },
    });
  });

  it("full payout gives the pilot 85% at the default rate", () => {
    const result = computeDisputeSplit({ resolutionType: "full_payout", agreedAmount: 1000 });
    assert.deepEqual(result, {
      ok: true,
      split: { pilotAmount: 850, clientAmount: 0, platformAmount: 150 },
    });
  });

  it("partial payout refunds the remainder after commission", () => {
    const result = computeDisputeSplit({
      resolutionType: "partial_payout",
      agreedAmount: 1000,
      pilotAmount: 400,
    });
    assert.deepEqual(result, {
      ok: true,
      split: { pilotAmount: 400, clientAmount: 450, platformAmount: 150 },
    });
  });

  it("partial payout validates the amount", () => {
    assert.equal(
      computeDisputeSplit({ resolutionType: "partial_payout", agreedAmount: 100 }).ok,
      false,
    );
    assert.equal(
      computeDisputeSplit({
        resolutionType: "partial_payout",
        agreedAmount: 100,
        pilotAmount: 101,
      }).ok,
      false,
    );
  });

  it("custom split leaves the remainder to the platform", () => {
    const result = computeDisputeSplit({
      resolutionType: "custom_split",
      agreedAmount: 1000,
      pilotAmount: 500,
      clientAmount: 400,
    });
    assert.deepEqual(result, {
      ok: true,
      split: { pilotAmount: 500, clientAmount: 400, platformAmount: 100 },
    });
  });

  it("custom split rejects totals above the agreed amount", () => {
    const result = computeDisputeSplit({
      resolutionType: "custom_split",
      agreedAmount: 1000,
      pilotAmount: 700,
      clientAmount: 400,
    });
    assert.equal(result.ok, false);
  });
});
