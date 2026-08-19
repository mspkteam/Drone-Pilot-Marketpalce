import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDashboardRelativeTime,
  mapNotificationToActivity,
  mapPublicPilotToRecommended,
} from "@/lib/client/dashboard-overview";
import type { NotificationDto } from "@/types/notification";
import type { PublicPilotListItemDto } from "@/types/public-pilot";

describe("client dashboard overview", () => {
  it("formats relative timestamps", () => {
    const recent = new Date(Date.now() - 15 * 60_000).toISOString();
    assert.equal(formatDashboardRelativeTime(recent), "15 min ago");
  });

  it("maps bid notifications to activity items", () => {
    const notification: NotificationDto = {
      id: "n-1",
      userId: "user-1",
      type: "bid_received",
      channel: "in_app",
      title: "New bid",
      body: 'Alex Rivera submitted an offer on "Roof inspection".',
      payload: { jobId: "job-1", jobTitle: "Roof inspection" },
      href: null,
      status: "sent",
      readAt: null,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const activity = mapNotificationToActivity(notification);
    assert.equal(activity.actor, "Alex Rivera");
    assert.equal(activity.action, "submitted a proposal");
    assert.equal(activity.project, "Roof inspection");
  });

  it("maps public pilots to recommended cards", () => {
    const pilot: PublicPilotListItemDto = {
      id: "pilot-1",
      displayName: "Jordan Lee",
      bio: null,
      locationCity: "Denver",
      locationRegion: "CO",
      locationCountry: "US",
      servicesOffered: ["inspection"],
      hourlyRateMin: 120,
      hourlyRateMax: 160,
      averageRating: 4.6,
      reviewCount: 8,
      avatarUrl: null,
    };

    const mapped = mapPublicPilotToRecommended(pilot);
    assert.equal(mapped.initials, "JL");
    assert.equal(mapped.location, "Denver, CO");
    assert.equal(mapped.priceAmount, "$960/day");
    assert.equal(mapped.profileHref, "/pilots/pilot-1");
  });
});
