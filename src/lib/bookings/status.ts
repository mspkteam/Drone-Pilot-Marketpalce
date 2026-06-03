import type { BookingStatus } from "@/types/booking";

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: "Pending confirmation",
    confirmed: "Confirmed",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "Disputed",
  };
  return labels[status] ?? status;
}

export function getBookingStatusTone(
  status: BookingStatus,
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
    case "disputed":
      return "error";
    case "pending":
      return "warning";
    case "confirmed":
    case "in_progress":
    default:
      return "neutral";
  }
}

export type BookingActor = "client" | "pilot";

export function canTransitionBooking(
  actor: BookingActor,
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  if (from === to) return false;
  if (from === "completed" || from === "cancelled" || from === "disputed") {
    return false;
  }

  const clientTransitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["cancelled"],
    in_progress: ["completed", "cancelled"],
  };

  const pilotTransitions: Partial<Record<BookingStatus, BookingStatus[]>> = {
    confirmed: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
  };

  const allowed =
    actor === "client"
      ? clientTransitions[from]
      : pilotTransitions[from];

  return allowed?.includes(to) ?? false;
}

export function getAvailableBookingActions(
  actor: BookingActor,
  status: BookingStatus,
): { action: BookingStatus; label: string }[] {
  const actions: { action: BookingStatus; label: string }[] = [];

  if (actor === "client") {
    if (status === "pending") {
      actions.push({ action: "confirmed", label: "Confirm booking" });
    }
    if (status === "in_progress") {
      actions.push({ action: "completed", label: "Mark completed" });
    }
    if (status === "pending" || status === "confirmed") {
      actions.push({ action: "cancelled", label: "Cancel booking" });
    }
    if (status === "in_progress") {
      actions.push({ action: "cancelled", label: "Cancel booking" });
    }
  }

  if (actor === "pilot") {
    if (status === "confirmed") {
      actions.push({ action: "in_progress", label: "Start work" });
    }
    if (status === "in_progress") {
      actions.push({ action: "completed", label: "Mark completed" });
    }
    if (status === "confirmed" || status === "in_progress") {
      actions.push({ action: "cancelled", label: "Cancel booking" });
    }
  }

  return actions;
}

export function jobAcceptsApplications(status: string): boolean {
  return status === "open" || status === "in_bidding";
}
