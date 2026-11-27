/** RAS Payment v6 — jobs must END within 21 days of the booking (payment) date. */
export const BOOKING_WINDOW_DAYS = 21;

export const BOOKING_WINDOW_ERROR =
  "Jobs can only be booked up to 21 days in advance. Please choose an earlier date.";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcDay(value: Date | string): number | null {
  const date = typeof value === "string" ? new Date(value) : value;
  const time = date.getTime();
  if (Number.isNaN(time)) return null;
  return Math.floor(time / MS_PER_DAY);
}

/** True when the end date is on or before bookingDate + 21 days (calendar days, UTC). */
export function isWithinBookingWindow(
  endDate: Date | string | null | undefined,
  bookingDate: Date = new Date(),
): boolean {
  if (endDate == null || endDate === "") return true;
  const endDay = toUtcDay(endDate);
  const bookingDay = toUtcDay(bookingDate);
  if (endDay == null || bookingDay == null) return true;
  return endDay - bookingDay <= BOOKING_WINDOW_DAYS;
}

/** Returns the exact error string when outside the window, otherwise null. */
export function validateBookingWindow(
  endDate: Date | string | null | undefined,
  bookingDate: Date = new Date(),
): string | null {
  return isWithinBookingWindow(endDate, bookingDate) ? null : BOOKING_WINDOW_ERROR;
}
