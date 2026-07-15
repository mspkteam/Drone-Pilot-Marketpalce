/** Shared copy for Job Approval approve / reject confirmations. */

export const JOB_APPROVAL_VISIBILITY_STEPS = [
  "Mission status becomes Open.",
  "Client is notified that the mission was approved.",
  "Pilots see the mission by grade delay: A-1 48h · A-2 36h · A-3 24h · A-4 12h · A-5 6h · A-6 immediate.",
  "A-1 may view after their delay but cannot submit proposals (A-2+ when visible).",
  "Proposals start only after a grade’s visibility window opens.",
] as const;

export const JOB_REJECTION_NEXT_STEPS = [
  "Mission stays Rejected and is hidden from the pilot network.",
  "Client is notified with your rejection reason.",
  "Client can edit the brief and resubmit for approval.",
  "No bids, chat, or ratings can start until a later approval.",
] as const;

export const JOB_REJECT_REASON_PRESETS = [
  "Incomplete brief — missing scope, location, or deliverables",
  "Budget outside marketplace guidelines",
  "Safety, airspace, or operational concern",
  "Policy or terms of service violation",
  "Duplicate or spam posting",
] as const;
