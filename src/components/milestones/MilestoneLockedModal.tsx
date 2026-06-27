"use client";

import { useEffect } from "react";
import { MilestoneLockMessageBlock } from "@/components/milestones/MilestoneLockMessageBlock";
import type { MilestoneDefinition } from "@/lib/milestones";
import { getActiveMilestoneDefinition } from "@/lib/milestone-access";

type MilestoneLockedModalProps = {
  open: boolean;
  featureLabel: string;
  requiredMilestone: MilestoneDefinition;
  onClose: () => void;
};

export function MilestoneLockedModal({
  open,
  featureLabel,
  requiredMilestone,
  onClose,
}: MilestoneLockedModalProps) {
  const active = getActiveMilestoneDefinition();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="milestone-lock-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="milestone-lock-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-lock-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="milestone-lock-modal-glow" aria-hidden />

        <button
          type="button"
          className="milestone-lock-modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path
              d="M3 3l8 8M11 3 3 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <MilestoneLockMessageBlock
          featureLabel={featureLabel}
          requiredMilestone={requiredMilestone}
          activeMilestone={active}
          variant="modal"
        />

        <div className="milestone-lock-modal-actions">
          <button
            type="button"
            className="milestone-lock-modal-btn"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
