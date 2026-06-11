import type { PilotProposalUiStatus } from "@/lib/pilot/proposals-map";

type PilotProposalStatusBadgeProps = {
  status: PilotProposalUiStatus;
};

export function PilotProposalStatusBadge({ status }: PilotProposalStatusBadgeProps) {
  return (
    <span className={`pilot-proposals-status pilot-proposals-status--${status.toLowerCase()}`}>
      {status}
    </span>
  );
}
