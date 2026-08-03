import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCaptainClubStats,
  filterCaptainsClub,
  regionGroupForCountry,
  sortCaptainsClub,
} from "@/lib/pilot/captains-club";
import type { CaptainClubPilot } from "@/types/captains-club";

function sampleCaptain(overrides: Partial<CaptainClubPilot> = {}): CaptainClubPilot {
  return {
    id: "captain-1",
    initials: "AM",
    name: "Alex Morgan",
    lastName: "Morgan",
    memberNumber: "001000",
    location: "Denver, CO",
    regionGroup: "North America",
    rating: 4.9,
    ratingLabel: "4.9",
    reviewCount: 12,
    bio: "Corporate SAR captain.",
    badges: ["captain", "verified", "certified", "insured"],
    tierLabel: "A-6 CAPTAIN",
    tierCode: "A6_CAPTAIN",
    wingTypeLabel: "",
    wingSortKey: "~",
    serviceIds: ["inspection"],
    specialtyLabels: ["Inspection"],
    profileHref: "/pilots/captain-1",
    ...overrides,
  };
}

describe("captains club directory", () => {
  it("maps countries to region groups", () => {
    assert.equal(regionGroupForCountry("US"), "North America");
    assert.equal(regionGroupForCountry("DE"), "Western Europe");
  });

  it("filters by search, region, and specialty", () => {
    const captains = [
      sampleCaptain(),
      sampleCaptain({
        id: "captain-2",
        name: "Sarah Mitchell",
        location: "London, UK",
        regionGroup: "Western Europe",
        serviceIds: ["aerial_video"],
        specialtyLabels: ["Aerial Photography"],
      }),
    ];

    assert.equal(filterCaptainsClub(captains, "sarah", null, null).length, 1);
    assert.equal(
      filterCaptainsClub(captains, "", "Western Europe", null).length,
      1,
    );
    assert.equal(filterCaptainsClub(captains, "", null, "inspection").length, 1);
  });

  it("sorts by rating, name, member number, and last name", () => {
    const captains = [
      sampleCaptain({
        id: "a",
        name: "Zed Young",
        lastName: "Young",
        memberNumber: "001200",
        rating: 4.2,
        reviewCount: 1,
      }),
      sampleCaptain({
        id: "b",
        name: "Amy Adams",
        lastName: "Adams",
        memberNumber: "001050",
        rating: 4.9,
        reviewCount: 3,
      }),
    ];

    const byRating = sortCaptainsClub(captains, "highest_rated");
    assert.equal(byRating[0]?.id, "b");

    const byName = sortCaptainsClub(captains, "name_asc");
    assert.equal(byName[0]?.name, "Amy Adams");

    const byMember = sortCaptainsClub(captains, "member_number");
    assert.equal(byMember[0]?.id, "b");

    const byLast = sortCaptainsClub(captains, "last_name_asc");
    assert.equal(byLast[0]?.lastName, "Adams");
  });

  it("builds live stats from captain rows", () => {
    const stats = buildCaptainClubStats([
      sampleCaptain(),
      sampleCaptain({ id: "2", regionGroup: "Western Europe", rating: 4.8 }),
    ]);

    assert.equal(stats.activeCaptains, 2);
    assert.equal(stats.regionsCovered, 2);
    assert.equal(stats.averageRatingLabel, "4.9/5");
  });
});
