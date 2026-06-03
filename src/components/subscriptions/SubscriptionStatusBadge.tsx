import {
  getSubscriptionStatusLabel,
  getSubscriptionStatusTone,
} from "@/lib/subscriptions/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SubscriptionStatus } from "@/types/subscription";

export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus;
}) {
  const tone = getSubscriptionStatusTone(status);
  return (
    <StatusBadge tone={tone}>{getSubscriptionStatusLabel(status)}</StatusBadge>
  );
}
