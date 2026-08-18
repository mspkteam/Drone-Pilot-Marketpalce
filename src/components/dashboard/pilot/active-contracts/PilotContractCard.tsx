import Link from "next/link";
import {
  badgeToneForContractStatus,
  type PilotActiveContract,
} from "@/lib/pilot/active-contracts-types";
import { CalendarIcon, UploadIcon } from "./PilotActiveContractsIcons";

type PilotContractCardProps = {
  contract: PilotActiveContract;
};

export function PilotContractCard({ contract }: PilotContractCardProps) {
  const badgeTone = badgeToneForContractStatus(contract.status);

  return (
    <article className="pilot-contracts-card">
      <div className="pilot-contracts-card-top">
        <div className="pilot-contracts-card-copy">
          <p className="pilot-contracts-card-id">
            CONTRACT · {contract.contractId}
          </p>
          <h2 className="pilot-contracts-card-title">{contract.title}</h2>
          <p className="pilot-contracts-card-client">{contract.client}</p>
        </div>

        <div className="pilot-contracts-card-value-block">
          <div className="pilot-contracts-value-col">
            <p className="pilot-contracts-value-label">Value</p>
            <p className="pilot-contracts-value-amount">{contract.value}</p>
          </div>
          <span
            className={`pilot-contracts-badge pilot-contracts-badge--${badgeTone}`}
          >
            {contract.status}
          </span>
        </div>
      </div>

      <div className="pilot-contracts-card-meta">
        <div>
          <p className="pilot-contracts-meta-label">Deadline</p>
          <p className="pilot-contracts-meta-value">
            <CalendarIcon />
            {contract.deadline}
          </p>
        </div>
      </div>

      <div className="pilot-contracts-card-actions">
        <Link href={contract.deliverHref} className="pilot-contracts-btn-gold">
          <UploadIcon />
          Deliver Work
        </Link>
        <Link href={contract.messageHref} className="pilot-contracts-btn-outline">
          Message Client
        </Link>
        <Link href={contract.disputeHref} className="pilot-contracts-btn-danger">
          Open Dispute
        </Link>
      </div>
    </article>
  );
}
