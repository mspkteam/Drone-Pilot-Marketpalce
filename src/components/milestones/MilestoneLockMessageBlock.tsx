import { MilestoneLockIcon } from "@/components/milestones/MilestoneLockIcon";
import type { MilestoneDefinition } from "@/lib/milestones";
import { cn } from "@/lib/utils";

type MilestoneLockMessageBlockProps = {
  featureLabel: string;
  requiredMilestone: MilestoneDefinition;
  activeMilestone: MilestoneDefinition;
  /** `screen` = full-page layout; `modal` = compact dialog layout */
  variant?: "screen" | "modal";
  className?: string;
};

export function MilestoneLockMessageBlock({
  featureLabel,
  requiredMilestone,
  activeMilestone,
  variant = "screen",
  className,
}: MilestoneLockMessageBlockProps) {
  return (
    <div
      className={cn(
        "milestone-lock-message",
        variant === "modal" && "milestone-lock-message--modal",
        className,
      )}
    >
      <div className="milestone-lock-message-icon-wrap">
        <MilestoneLockIcon size={variant === "modal" ? 22 : 26} />
      </div>

      <p className="milestone-lock-message-eyebrow">
        Scheduled for {requiredMilestone.weekLabel}
      </p>

      <h1
        id="milestone-lock-title"
        className={cn(
          "milestone-lock-message-title",
          variant === "modal" && "milestone-lock-message-title--modal",
        )}
      >
        {featureLabel}
      </h1>

      <p className="milestone-lock-message-milestone">
        Milestone {requiredMilestone.number} — {requiredMilestone.title}
      </p>

      <div className="milestone-lock-message-body">
        <p>{requiredMilestone.lockedMessage}</p>
      </div>

      <p className="milestone-lock-message-footnote">
        Currently in progress:{" "}
        <strong>
          {activeMilestone.weekLabel} — {activeMilestone.title}
        </strong>
        <span className="milestone-lock-message-dates">
          {" "}
          · {activeMilestone.dateRange}
        </span>
      </p>
    </div>
  );
}
