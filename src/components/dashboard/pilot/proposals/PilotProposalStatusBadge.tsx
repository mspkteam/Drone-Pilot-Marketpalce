import type { PilotProposalUiStatus } from "@/lib/pilot/proposals-map";

type PilotProposalStatusBadgeProps = {
  status: PilotProposalUiStatus;
  label?: string;
};

export function PilotProposalStatusBadge({
  status,
  label,
}: PilotProposalStatusBadgeProps) {
  return (
    <span className={`pilot-proposals-status pilot-proposals-status--${status.toLowerCase()}`}>
      {label ?? status}
    </span>
  );
}
