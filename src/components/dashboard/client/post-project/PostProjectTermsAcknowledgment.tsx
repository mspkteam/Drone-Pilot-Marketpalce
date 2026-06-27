import {
  POST_PROJECT_OFF_PLATFORM_ACK_AFTER,
  POST_PROJECT_OFF_PLATFORM_ACK_BEFORE,
  POST_PROJECT_OFF_PLATFORM_ACK_LINK,
} from "@/lib/client/post-project-constants";
import { cn } from "@/lib/utils";

type PostProjectTermsAcknowledgmentProps = {
  acknowledged: boolean;
  variant?: "review" | "modal";
  onOpenTerms?: () => void;
  onAcknowledgedChange?: (acknowledged: boolean) => void;
};

function AcknowledgmentCopy({ highlightLink = true }: { highlightLink?: boolean }) {
  return (
    <>
      {POST_PROJECT_OFF_PLATFORM_ACK_BEFORE}
      {highlightLink ? (
        <span className="client-post-project-terms-link">{POST_PROJECT_OFF_PLATFORM_ACK_LINK}</span>
      ) : (
        POST_PROJECT_OFF_PLATFORM_ACK_LINK
      )}
      {POST_PROJECT_OFF_PLATFORM_ACK_AFTER}
    </>
  );
}

export function PostProjectTermsAcknowledgment({
  acknowledged,
  variant = "review",
  onOpenTerms,
  onAcknowledgedChange,
}: PostProjectTermsAcknowledgmentProps) {
  const isReview = variant === "review";

  if (isReview) {
    return (
      <button
        type="button"
        className={cn(
          "client-post-project-terms-checkbox",
          "client-post-project-terms-checkbox--opens-modal",
        )}
        onClick={() => onOpenTerms?.()}
      >
        <span
          className={cn(
            "client-post-project-terms-checkbox-indicator",
            acknowledged && "client-post-project-terms-checkbox-indicator--checked",
          )}
          aria-hidden
        />
        <span className="client-post-project-terms-checkbox-copy">
          <AcknowledgmentCopy />
        </span>
      </button>
    );
  }

  return (
    <label className="client-post-project-terms-checkbox client-post-project-terms-checkbox--modal">
      <input
        type="checkbox"
        checked={acknowledged}
        onChange={(e) => onAcknowledgedChange?.(e.target.checked)}
      />
      <span className="client-post-project-terms-checkbox-copy">
        <AcknowledgmentCopy />
      </span>
    </label>
  );
}
