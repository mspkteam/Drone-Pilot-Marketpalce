import {
  getBookingStatusLabel,
  getBookingStatusTone,
} from "@/lib/bookings/status";
import type { BookingStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "bg-surface text-muted-foreground border-border",
  warning: "bg-gold/10 text-gold-dark border-gold/30",
  success: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30",
  error: "bg-destructive/10 text-destructive border-destructive/30",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const tone = getBookingStatusTone(status);
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
      )}
    >
      {getBookingStatusLabel(status)}
    </span>
  );
}
