import {
  getBookingStatusLabel,
  getBookingStatusTone,
} from "@/lib/bookings/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BookingStatus } from "@/types/booking";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const tone = getBookingStatusTone(status);
  return (
    <StatusBadge tone={tone}>{getBookingStatusLabel(status)}</StatusBadge>
  );
}
