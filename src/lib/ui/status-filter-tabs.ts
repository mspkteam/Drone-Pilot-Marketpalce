/** UI-only filter tab order for dashboard queues (values unchanged for API/DB). */

export type StatusFilterTab<T extends string> = {
  value: T;
  label: string;
};

/** Approval queues: All → Pending → Approved → Rejected */
export function approvalStatusFilterTabs<
  TPending extends string,
  TApproved extends string,
  TRejected extends string,
>(values: {
  pending: TPending;
  approved: TApproved;
  rejected: TRejected;
}): StatusFilterTab<TPending | TApproved | TRejected | "all">[] {
  return [
    { value: "all", label: "All" },
    { value: values.pending, label: "Pending" },
    { value: values.approved, label: "Approved" },
    { value: values.rejected, label: "Rejected" },
  ];
}

/** Admin job moderation: All → Awaiting review → Approved → Rejected */
export function jobAdminStatusFilterTabs(): StatusFilterTab<
  "all" | "pending_approval" | "open" | "rejected"
>[] {
  return [
    { value: "all", label: "All" },
    { value: "pending_approval", label: "Awaiting review" },
    { value: "open", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];
}

/** Dispute list: All → Open → Under review → Resolved */
export function disputeStatusFilterTabs(): StatusFilterTab<
  "all" | "open" | "under_review" | "resolved"
>[] {
  return [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "under_review", label: "Under review" },
    { value: "resolved", label: "Resolved" },
  ];
}
