import type { NotificationType } from "@/types/notification";
import type { UserRole } from "@/types/roles";
import { isAdminRole } from "@/types/roles";

function payloadId(
  payload: Record<string, unknown> | null,
  key: string,
): string | undefined {
  const value = payload?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function dashboardArea(
  role: UserRole,
): "client" | "pilot" | "admin" | null {
  if (role === "client") return "client";
  if (role === "pilot") return "pilot";
  if (isAdminRole(role)) return "admin";
  return null;
}

function welcomeHref(
  payload: Record<string, unknown> | null,
  role: UserRole,
): string | null {
  const orderId = payloadId(payload, "orderId");
  if (orderId) return `/dashboard/pilot/shop/orders/${orderId}`;

  const certificateId = payloadId(payload, "certificateId");
  if (certificateId) return `/dashboard/pilot/certificates`;

  if (payloadId(payload, "pilotProfileId")) {
    return "/dashboard/pilot/profile";
  }

  const area = dashboardArea(role);
  if (area === "client") return "/dashboard/client/onboarding";
  if (area === "pilot") return "/dashboard/pilot/onboarding";
  if (area === "admin") return "/dashboard/admin";
  return null;
}

/** Resolve in-app path for a notification click (role-aware). */
export function getNotificationHref(
  type: NotificationType,
  payload: Record<string, unknown> | null,
  role: UserRole,
): string | null {
  const area = dashboardArea(role);
  const jobId = payloadId(payload, "jobId");
  const bookingId = payloadId(payload, "bookingId");
  const conversationId = payloadId(payload, "conversationId");
  const disputeId = payloadId(payload, "disputeId");
  const verificationId = payloadId(payload, "verificationId");

  switch (type) {
    case "welcome":
      return welcomeHref(payload, role);

    case "job_submitted":
    case "job_approved":
    case "job_rejected":
      if (area === "admin" && jobId) {
        return `/dashboard/admin/jobs/${jobId}`;
      }
      if (area === "client" && jobId) {
        return `/dashboard/client/jobs/${jobId}`;
      }
      return area === "client" ? "/dashboard/client/jobs" : null;

    case "bid_received":
      if (area === "client" && jobId) {
        return `/dashboard/client/jobs/${jobId}/offers`;
      }
      return area === "client" ? "/dashboard/client/jobs" : null;

    case "bid_accepted":
      if (area === "pilot" && bookingId) {
        return `/dashboard/pilot/bookings/${bookingId}`;
      }
      return area === "pilot" ? "/dashboard/pilot/bookings" : null;

    case "booking_status":
    case "booking_completed":
      if (area === "client" && bookingId) {
        return `/dashboard/client/bookings/${bookingId}`;
      }
      if (area === "pilot" && bookingId) {
        return `/dashboard/pilot/bookings/${bookingId}`;
      }
      if (area === "client") return "/dashboard/client/bookings";
      if (area === "pilot") return "/dashboard/pilot/bookings";
      return null;

    case "review_received":
      if (area === "client" && bookingId) {
        return `/dashboard/client/bookings/${bookingId}`;
      }
      if (area === "pilot" && bookingId) {
        return `/dashboard/pilot/bookings/${bookingId}`;
      }
      if (area === "client") return "/dashboard/client/reviews";
      if (area === "pilot") return "/dashboard/pilot/reviews";
      return null;

    case "message_received":
      if (conversationId && area) {
        return `/dashboard/${area}/messages/${conversationId}`;
      }
      if (area) return `/dashboard/${area}/messages`;
      return null;

    case "dispute_update":
      if (area === "admin" && disputeId) {
        return `/dashboard/admin/disputes/${disputeId}`;
      }
      if (bookingId && area === "client") {
        return `/dashboard/client/bookings/${bookingId}`;
      }
      if (bookingId && area === "pilot") {
        return `/dashboard/pilot/bookings/${bookingId}`;
      }
      if (area === "admin") return "/dashboard/admin/disputes";
      return null;

    case "verification_approved":
    case "verification_rejected":
      return area === "pilot" ? "/dashboard/pilot/verifications" : null;

    case "wing_earned":
      return area === "pilot" ? "/dashboard/pilot/achievements" : null;

    case "support_chat": {
      const supportChatId = payloadId(payload, "supportChatId");
      if (area === "admin" && supportChatId) {
        return `/dashboard/admin/support/${supportChatId}`;
      }
      if (supportChatId && (area === "client" || area === "pilot")) {
        return `/dashboard/${area}`;
      }
      return area === "admin" ? "/dashboard/admin/support" : null;
    }

    default:
      return null;
  }
}
