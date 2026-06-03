import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getNotificationHref } from "@/lib/notifications/routes";

describe("getNotificationHref", () => {
  it("routes client job approval to job detail", () => {
    const href = getNotificationHref(
      "job_approved",
      { jobId: "job-1" },
      "client",
    );
    assert.equal(href, "/dashboard/client/jobs/job-1");
  });

  it("routes pilot bid accepted to booking", () => {
    const href = getNotificationHref(
      "bid_accepted",
      { bookingId: "bk-1" },
      "pilot",
    );
    assert.equal(href, "/dashboard/pilot/bookings/bk-1");
  });

  it("routes message to conversation thread", () => {
    const href = getNotificationHref(
      "message_received",
      { conversationId: "conv-1" },
      "pilot",
    );
    assert.equal(href, "/dashboard/pilot/messages/conv-1");
  });

  it("routes uniform order welcome payload", () => {
    const href = getNotificationHref(
      "welcome",
      { orderId: "ord-1" },
      "pilot",
    );
    assert.equal(href, "/dashboard/pilot/shop/orders/ord-1");
  });

  it("routes admin dispute to dispute detail", () => {
    const href = getNotificationHref(
      "dispute_update",
      { disputeId: "disp-1", bookingId: "bk-1" },
      "moderator",
    );
    assert.equal(href, "/dashboard/admin/disputes/disp-1");
  });
});
