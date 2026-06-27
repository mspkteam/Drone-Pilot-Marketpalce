"use client";

import Link from "next/link";
import { MilestoneLockMessageBlock } from "@/components/milestones/MilestoneLockMessageBlock";
import type { MilestoneDefinition } from "@/lib/milestones";
import { getActiveMilestoneDefinition } from "@/lib/milestone-access";

type MilestoneLockedScreenProps = {
  featureLabel: string;
  requiredMilestone: MilestoneDefinition;
  dashboardHomeHref: string;
  currentWeekHref: string;
  previewBypass?: boolean;
};

export function MilestoneLockedScreen({
  featureLabel,
  requiredMilestone,
  dashboardHomeHref,
  currentWeekHref,
  previewBypass = false,
}: MilestoneLockedScreenProps) {
  const active = getActiveMilestoneDefinition();

  return (
    <section className="milestone-lock-screen" aria-labelledby="milestone-lock-title">
      <div className="milestone-lock-screen-card">
        <div className="milestone-lock-screen-glow" aria-hidden />

        <MilestoneLockMessageBlock
          featureLabel={featureLabel}
          requiredMilestone={requiredMilestone}
          activeMilestone={active}
          variant="screen"
        />

        {previewBypass ? (
          <p className="milestone-lock-screen-preview" role="status">
            Administrator preview is enabled. End users will remain locked until this
            milestone is officially unlocked.
          </p>
        ) : null}

        <div className="milestone-lock-screen-actions">
          <Link href={dashboardHomeHref} className="milestone-lock-screen-btn-primary">
            Back to Dashboard
          </Link>
          <Link href={currentWeekHref} className="milestone-lock-screen-btn-outline">
            View Current Week Features
          </Link>
        </div>
      </div>
    </section>
  );
}
