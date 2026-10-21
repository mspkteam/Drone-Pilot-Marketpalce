import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computePilotProfileStrength,
  computePilotProfileStrengthFromProfile,
} from "@/lib/pilot/pilot-profile-strength";

describe("computePilotProfileStrength", () => {
  it("scores empty profile at 0%", () => {
    const result = computePilotProfileStrength({
      form: {
        displayName: "",
        bio: "",
        locationCity: "",
        locationCountry: "",
        servicesOffered: [],
      },
      avatarPreview: null,
      portfolioCount: 0,
      insuranceVerified: false,
    });
    assert.equal(result.pct, 0);
    assert.equal(result.items.every((i) => i.status === "missing"), true);
  });

  it("ignores placeholder New Pilot display name", () => {
    const result = computePilotProfileStrength({
      form: {
        displayName: "New Pilot",
        bio: "Experienced aerial operator.",
        locationCity: "Austin",
        locationCountry: "US",
        servicesOffered: ["aerial_video"],
        complianceAcknowledged: ["a", "b", "c", "d"],
      },
      avatarPreview: "https://example.com/a.jpg",
      portfolioCount: 8,
      insuranceVerified: true,
      mainDrones: ["Mavic 3"],
    });
    // name missing (10), everything else done = 90
    assert.equal(result.pct, 90);
    assert.equal(
      result.items.find((i) => i.label === "Display name")?.status,
      "missing",
    );
  });

  it("awards partial portfolio points before target of 8", () => {
    const result = computePilotProfileStrength({
      form: {
        displayName: "Alex Pilot",
        bio: "Bio text",
        locationCity: "Austin",
        locationCountry: "US",
        servicesOffered: ["aerial_video"],
      },
      avatarPreview: "https://example.com/a.jpg",
      portfolioCount: 4,
      insuranceVerified: false,
      mainDrones: ["Mavic 3"],
      complianceAccepted: true,
    });
    // 10*7 binary fields + 10 portfolio partial (4/8*20) = 70 + 10 = 80
    assert.equal(result.pct, 80);
    assert.equal(
      result.items.find((i) => i.label.startsWith("Portfolio"))?.status,
      "partial",
    );
  });

  it("counts specialty chips as services when servicesOffered is empty", () => {
    const result = computePilotProfileStrength({
      form: {
        displayName: "Alex Pilot",
        bio: "Bio",
        locationCity: "Austin",
        locationCountry: "US",
        servicesOffered: [],
      },
      avatarPreview: null,
      portfolioCount: 0,
      insuranceVerified: false,
      localChipIds: ["thermal"],
    });
    assert.equal(
      result.items.find((i) => i.label === "Services")?.status,
      "done",
    );
  });

  it("matches live form and persisted profile scores", () => {
    const formScore = computePilotProfileStrength({
      form: {
        displayName: "Alex Pilot",
        bio: "Bio text here",
        locationCity: "Austin",
        locationCountry: "US",
        servicesOffered: ["aerial_video"],
      },
      avatarPreview: "https://cdn.example/a.jpg",
      portfolioCount: 2,
      insuranceVerified: true,
      mainDrones: ["Air 2S"],
      complianceAccepted: true,
    });

    const persisted = computePilotProfileStrengthFromProfile({
      displayName: "Alex Pilot",
      bio: "Bio text here",
      locationCity: "Austin",
      locationCountry: "US",
      servicesOffered: JSON.stringify(["aerial_video"]),
      portfolioJson: JSON.stringify([
        {
          id: "1",
          type: "PHOTOSET",
          title: "One",
          tags: ["AERIAL"],
          thumbnailUrl: null,
          mediaUrl: "https://x/1.jpg",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          type: "VIDEO",
          title: "Two",
          tags: ["AERIAL"],
          thumbnailUrl: null,
          mediaUrl: "https://x/2.jpg",
          createdAt: "2026-01-02T00:00:00.000Z",
        },
      ]),
      profileExtrasJson: JSON.stringify({
        avatarUrl: "https://cdn.example/a.jpg",
        mainDrones: ["Air 2S"],
        payloads: [],
        localChipIds: [],
      }),
      complianceAcceptedAt: new Date().toISOString(),
      insuranceVerified: true,
    });

    assert.equal(formScore.pct, persisted.pct);
    assert.deepEqual(
      formScore.items.map((i) => i.status),
      persisted.items.map((i) => i.status),
    );
  });
});
