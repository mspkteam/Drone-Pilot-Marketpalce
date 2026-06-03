import type { UniformOrderStatus, UniformPaymentStatus } from "@/types/shop";

export function getUniformOrderStatusLabel(status: UniformOrderStatus): string {
  const labels: Record<UniformOrderStatus, string> = {
    pending_payment: "Awaiting payment",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}

export function getUniformPaymentStatusLabel(
  status: UniformPaymentStatus,
): string {
  const labels: Record<UniformPaymentStatus, string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  };
  return labels[status] ?? status;
}

export function getUniformOrderStatusTone(
  status: UniformOrderStatus,
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "delivered":
    case "paid":
      return "success";
    case "cancelled":
      return "error";
    case "pending_payment":
      return "warning";
    default:
      return "neutral";
  }
}
