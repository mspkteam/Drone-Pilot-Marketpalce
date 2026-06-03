import {
  getUniformOrderStatusLabel,
  getUniformOrderStatusTone,
} from "@/lib/shop/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { UniformOrderStatus } from "@/types/shop";

export function UniformOrderStatusBadge({
  status,
}: {
  status: UniformOrderStatus;
}) {
  const tone = getUniformOrderStatusTone(status);
  return (
    <StatusBadge tone={tone}>{getUniformOrderStatusLabel(status)}</StatusBadge>
  );
}
