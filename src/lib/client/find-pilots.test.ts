import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterFindPilots,
  mapPublicPilotToFindPilot,
  type ClientFindPilot,
} from "@/lib/client/find-pilots";
import type { PublicPilotListItemDto } from "@/types/public-pilot";

const samplePilotDto: PublicPilotListItemDto = {
  id: "pilot-1",
  displayName: "Alex Rivera",
  bio: null,
  locationCity: "Austin",
  locationRegion: "TX",
  locationCountry: "US",
  servicesOffered: ["aerial_video", "real_estate"],
  hourlyRateMin: 150,
  hourlyRateMax: 200,
  averageRating: 4.8,
  reviewCount: 12,
};

function samplePilot(overrides: Partial<ClientFindPilot> = {}): ClientFindPilot {
  return {
    id: "pilot-1",
    initials: "AR",
    name: "Alex Rivera",
    location: "Austin, TX",
    rating: "4.8",
    projects: "5 projects",
    hours: "Experienced operator",
    tags: ["Aerial Photography", "Real Estate"],
    priceLabel: "from $1,200/day",
    serviceIds: ["aerial_video", "real_estate"],
    verified: true,
    profileHref: "/pilots/pilot-1",
    ...overrides,
  };
}

describe("client find pilots", () => {
  it("maps public pilot DTOs to directory cards", () => {
    const mapped = mapPublicPilotToFindPilot(samplePilotDto, 5);
    assert.equal(mapped.initials, "AR");
    assert.equal(mapped.location, "Austin, TX");
    assert.equal(mapped.projects, "5 projects");
    assert.equal(mapped.profileHref, "/pilots/pilot-1");
  });

  it("filters by service chip", () => {
    const pilots = [
      samplePilot(),
      samplePilot({
        id: "pilot-2",
        serviceIds: ["surveying"],
        tags: ["Survey"],
      }),
    ];

    const filtered = filterFindPilots(pilots, "", "surveying");
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.id, "pilot-2");
  });

  it("filters by search query across name, location, and tags", () => {
    const pilots = [
      samplePilot(),
      samplePilot({
        id: "pilot-2",
        name: "Jordan Lee",
        location: "Denver, CO",
        tags: ["Inspection"],
        serviceIds: ["inspection"],
      }),
    ];

    assert.equal(filterFindPilots(pilots, "denver", null).length, 1);
    assert.equal(filterFindPilots(pilots, "real estate", null).length, 1);
    assert.equal(filterFindPilots(pilots, "alex", null).length, 1);
  });
});
