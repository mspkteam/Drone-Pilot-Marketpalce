import type { SubscriptionStatus } from "@/types/subscription";

export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    trialing: "Trial",
    active: "Active",
    past_due: "Past due",
    cancelled: "Cancelled",
    expired: "Expired",
  };
  return labels[status] ?? status;
}

export function getSubscriptionStatusTone(
  status: SubscriptionStatus,
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "active":
    case "trialing":
      return "success";
    case "past_due":
      return "warning";
    case "cancelled":
    case "expired":
      return "error";
    default:
      return "neutral";
  }
}

export function isSubscriptionUsable(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}

export function formatJobVisibilityDelay(hours: number): string {
  if (hours === 0) return "Immediate";
  if (hours === 1) return "1 hour after job approval";
  return `${hours} hours after job approval`;
}
