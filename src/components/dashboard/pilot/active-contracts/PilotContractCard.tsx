import Link from "next/link";
import {
  badgeToneForContractStatus,
  type PilotActiveContract,
} from "@/lib/pilot/active-contracts-types";
import { ClientIcon, ContractIcon } from "./PilotActiveContractsIcons";

type PilotContractCardProps = {
  contract: PilotActiveContract;
};

export function PilotContractCard({ contract }: PilotContractCardProps) {
  const badgeTone = badgeToneForContractStatus(contract.status);

  return (
    <article className="client-my-projects-card">
      <div className="client-my-projects-card-top">
        <h2 className="client-my-projects-card-title">{contract.title}</h2>
        <span
          className={`client-my-projects-badge client-my-projects-badge--${badgeTone}`}
        >
          {contract.status}
        </span>
      </div>

      <div className="client-my-projects-card-meta">
        <span className="client-my-projects-meta-item">
          <ClientIcon />
          {contract.client}
        </span>
        <span className="client-my-projects-meta-item">
          <ContractIcon />
          {contract.contractId}
        </span>
      </div>

      <div className="client-my-projects-stats">
        <div className="client-my-projects-stat">
          <span className="client-my-projects-stat-label">Deadline</span>
          <span className="client-my-projects-stat-value">{contract.deadline}</span>
        </div>
        <div className="client-my-projects-stat">
          <span className="client-my-projects-stat-label">Value</span>
          <span className="client-my-projects-stat-value">{contract.value}</span>
        </div>
      </div>

      <div className="client-my-projects-card-actions client-my-projects-card-actions--contracts">
        <div className="client-my-projects-card-actions-primary">
          <Link href={contract.deliverHref} className="client-my-projects-btn-gold">
            Deliver Work
          </Link>
          <Link href={contract.messageHref} className="client-my-projects-btn-outline">
            Message Client
          </Link>
        </div>
        <Link href={contract.disputeHref} className="client-my-projects-btn-danger">
          Open Dispute
        </Link>
      </div>
    </article>
  );
}
