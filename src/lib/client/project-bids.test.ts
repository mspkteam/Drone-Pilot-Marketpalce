import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applicationStatusToBidStatus,
  applyShortlistToBids,
  badgeToneForBidStatus,
  filterClientProjectBids,
  formatDeliveryDays,
  mapOfferToProjectBid,
  type ClientProjectBid,
} from "@/lib/client/project-bids";
import type { ClientJobApplicationDto } from "@/types/booking";

function sampleBid(
  overrides: Partial<ClientProjectBid> = {},
): ClientProjectBid {
  return {
    id: "app-1",
    applicationId: "app-1",
    jobId: "job-1",
    pilotProfileId: "pilot-1",
    initials: "AR",
    avatarUrl: null,
    name: "Alex Rivera",
    verified: true,
    reviewCount: 10,
    rating: "4.8",
    ratingLabel: "4.8 Rating",
    completedProjects: "5 completed projects",
    bidAmount: "$1,200",
    deliveryDays: 3,
    status: "Pending Review",
    applicationStatus: "submitted",
    proposalNote: "Ready to fly.",
    highlights: [],
    ...overrides,
  };
}

const sampleOffer: ClientJobApplicationDto = {
  id: "app-99",
  jobId: "job-1",
  pilotProfileId: "pilot-1",
  status: "submitted",
  proposedAmount: 1200,
  currency: "USD",
  message: "Experienced pilot\nFAA Part 107\nInsurance included",
  estimatedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString(),
  submittedAt: new Date().toISOString(),
  shortlistedAt: null,
  pilot: {
    id: "pilot-1",
    displayName: "Alex Rivera",
    locationCity: "Austin",
    locationRegion: "TX",
    averageRating: 4.8,
    reviewCount: 10,
    completedBookings: 5,
    verified: true,
  },
};

describe("client project bids", () => {
  it("maps application statuses to bid statuses", () => {
    assert.equal(applicationStatusToBidStatus("submitted", false), "Pending Review");
    assert.equal(applicationStatusToBidStatus("submitted", true), "Shortlisted");
    assert.equal(applicationStatusToBidStatus("accepted", false), "Accepted");
    assert.equal(applicationStatusToBidStatus("rejected", false), "Declined");
  });

  it("filters bids by tab", () => {
    const bids = [
      sampleBid({ id: "1", status: "Pending Review" }),
      sampleBid({ id: "2", status: "Accepted" }),
      sampleBid({ id: "3", status: "Declined" }),
    ];

    assert.equal(filterClientProjectBids(bids, "all").length, 3);
    assert.equal(filterClientProjectBids(bids, "accepted").length, 1);
    assert.equal(filterClientProjectBids(bids, "declined").length, 1);
  });

  it("assigns badge tones by bid status", () => {
    assert.equal(badgeToneForBidStatus("Accepted"), "green");
    assert.equal(badgeToneForBidStatus("Declined"), "red");
    assert.equal(badgeToneForBidStatus("Shortlisted"), "gold");
  });

  it("formats delivery days", () => {
    assert.equal(formatDeliveryDays(null), "TBD");
    assert.equal(formatDeliveryDays(1), "1 day");
    assert.equal(formatDeliveryDays(4), "4 days");
  });

  it("maps offer DTOs to bid cards", () => {
    const mapped = mapOfferToProjectBid(sampleOffer);
    assert.equal(mapped.applicationId, "app-99");
    assert.equal(mapped.bidAmount, "$1,200");
    assert.equal(mapped.status, "Pending Review");
    assert.equal(mapped.rating, "4.8");
    assert.ok(mapped.highlights.length > 0);

    const shortlisted = mapOfferToProjectBid({
      ...sampleOffer,
      shortlistedAt: new Date().toISOString(),
    });
    assert.equal(shortlisted.status, "Shortlisted");

    const buildingHistory = mapOfferToProjectBid({
      ...sampleOffer,
      pilot: {
        ...sampleOffer.pilot,
        reviewCount: 3,
        averageRating: 4.9,
      },
    });
    assert.equal(buildingHistory.rating, null);
    assert.equal(buildingHistory.ratingLabel, "Building Review History");
  });

  it("applies shortlist state to submitted bids only", () => {
    const bids = [
      sampleBid({ id: "submitted", applicationStatus: "submitted" }),
      sampleBid({
        id: "accepted",
        applicationStatus: "accepted",
        status: "Accepted",
      }),
    ];

    const updated = applyShortlistToBids(
      bids,
      new Set(["submitted"]),
    );

    assert.equal(updated[0]?.status, "Shortlisted");
    assert.equal(updated[1]?.status, "Accepted");
  });
});
