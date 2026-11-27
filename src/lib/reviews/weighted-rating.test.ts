import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  REVIEW_WEIGHT_MIN,
  reviewRecencyWeight,
  weightedAverageRating,
} from "./weighted-rating";

const NOW = new Date("2026-06-01T00:00:00Z");
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);

describe("weightedAverageRating", () => {
  it("returns null for no reviews", () => {
    assert.equal(weightedAverageRating([], { now: NOW }), null);
  });

  it("equals plain average when all reviews are the same age", () => {
    const avg = weightedAverageRating(
      [
        { rating: 5, createdAt: daysAgo(10) },
        { rating: 3, createdAt: daysAgo(10) },
      ],
      { now: NOW },
    );
    assert.equal(avg, 4);
  });

  it("weights recent reviews more than old ones", () => {
    const reviews = [
      { rating: 5, createdAt: daysAgo(1) },
      { rating: 1, createdAt: daysAgo(730) },
    ];
    const avg = weightedAverageRating(reviews, { now: NOW })!;
    assert.ok(avg > 3, `expected > 3 (plain avg), got ${avg}`);
    const flipped = weightedAverageRating(
      [
        { rating: 1, createdAt: daysAgo(1) },
        { rating: 5, createdAt: daysAgo(730) },
      ],
      { now: NOW },
    )!;
    assert.ok(flipped < 3);
  });

  it("halves weight at the half-life and has a floor", () => {
    assert.ok(Math.abs(reviewRecencyWeight(daysAgo(365), NOW) - 0.5) < 1e-9);
    assert.equal(reviewRecencyWeight(daysAgo(36500), NOW), REVIEW_WEIGHT_MIN);
    assert.equal(reviewRecencyWeight(daysAgo(-5), NOW), 1);
  });

  it("accepts ISO string dates", () => {
    assert.equal(
      weightedAverageRating(
        [{ rating: 4, createdAt: daysAgo(5).toISOString() }],
        { now: NOW },
      ),
      4,
    );
  });
});
