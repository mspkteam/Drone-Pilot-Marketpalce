import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOOKING_WINDOW_ERROR,
  isWithinBookingWindow,
  validateBookingWindow,
} from "@/lib/bookings/booking-window";

const now = new Date("2026-11-27T12:00:00Z");

describe("booking window", () => {
  it("allows null/empty end dates", () => {
    assert.equal(isWithinBookingWindow(null, now), true);
    assert.equal(isWithinBookingWindow("", now), true);
  });

  it("allows end date exactly 21 days out", () => {
    assert.equal(isWithinBookingWindow("2026-12-18", now), true);
  });

  it("rejects end date 22 days out", () => {
    assert.equal(isWithinBookingWindow("2026-12-19", now), false);
    assert.equal(validateBookingWindow("2026-12-19", now), BOOKING_WINDOW_ERROR);
  });

  it("accepts Date objects and ignores invalid dates", () => {
    assert.equal(isWithinBookingWindow(new Date("2027-03-01T00:00:00Z"), now), false);
    assert.equal(isWithinBookingWindow("not-a-date", now), true);
  });

  it("uses the exact error message", () => {
    assert.equal(
      BOOKING_WINDOW_ERROR,
      "Jobs can only be booked up to 21 days in advance. Please choose an earlier date.",
    );
  });
});
