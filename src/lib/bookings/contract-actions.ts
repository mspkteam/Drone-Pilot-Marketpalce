import type { BookingStatus } from "@/types/booking";
import type { DeliveryStatus } from "@/types/delivery";

/** Pilot-facing contract lifecycle labels (delivery-aware). */
export type PilotContractPhase =
  | "pending"
  | "ready"
  | "in_progress"
  | "awaiting_review"
  | "revisions_requested"
  | "completed"
  | "cancelled"
  | "disputed";

export type ContractActionId =
  | "deliver"
  | "resubmit"
  | "view_delivery"
  | "view_contract"
  | "message"
  | "dispute"
  | "view_dispute";

export type ContractAction = {
  id: ContractActionId;
  label: string;
  href: string;
  tone: "gold" | "outline" | "danger";
};

export function resolvePilotContractPhase(
  bookingStatus: BookingStatus,
  deliveryStatus: DeliveryStatus | null,
): PilotContractPhase {
  switch (bookingStatus) {
    case "pending":
      return "pending";
    case "confirmed":
      return "ready";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "disputed":
      return "disputed";
    case "in_progress":
      if (deliveryStatus === "submitted") return "awaiting_review";
      if (deliveryStatus === "rejected") return "revisions_requested";
      return "in_progress";
    default:
      return "in_progress";
  }
}

export function pilotContractPhaseLabel(phase: PilotContractPhase): string {
  switch (phase) {
    case "pending":
      return "Pending";
    case "ready":
      return "Ready to start";
    case "in_progress":
      return "In progress";
    case "awaiting_review":
      return "Awaiting review";
    case "revisions_requested":
      return "Revisions requested";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "disputed":
      return "Disputed";
  }
}

export function buildPilotContractActions(input: {
  phase: PilotContractPhase;
  detailHref: string;
  messageHref: string;
  deliverHref: string;
  disputeHref: string;
}): ContractAction[] {
  const { phase, detailHref, messageHref, deliverHref, disputeHref } = input;
  const actions: ContractAction[] = [];

  switch (phase) {
    case "in_progress":
      actions.push({
        id: "deliver",
        label: "Deliver Work",
        href: deliverHref,
        tone: "gold",
      });
      break;
    case "revisions_requested":
      actions.push({
        id: "resubmit",
        label: "Resubmit Work",
        href: deliverHref,
        tone: "gold",
      });
      break;
    case "awaiting_review":
      actions.push({
        id: "view_delivery",
        label: "View Submission",
        href: deliverHref,
        tone: "outline",
      });
      break;
    case "completed":
    case "cancelled":
    case "pending":
    case "ready":
      actions.push({
        id: "view_contract",
        label: "View Contract",
        href: detailHref,
        tone: "gold",
      });
      break;
    case "disputed":
      actions.push({
        id: "view_dispute",
        label: "View Dispute",
        href: disputeHref,
        tone: "danger",
      });
      break;
  }

  actions.push({
    id: "message",
    label: "Message Client",
    href: messageHref,
    tone: "outline",
  });

  if (
    phase === "ready" ||
    phase === "in_progress" ||
    phase === "awaiting_review" ||
    phase === "revisions_requested" ||
    phase === "completed"
  ) {
    actions.push({
      id: "dispute",
      label: "Open Dispute",
      href: disputeHref,
      tone: "danger",
    });
  }

  return actions;
}
