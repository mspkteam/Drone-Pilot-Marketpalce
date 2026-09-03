import Link from "next/link";
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

export function PostProjectTermsAcknowledgment({
  acknowledged,
  variant = "review",
  onOpenTerms,
  onAcknowledgedChange,
}: PostProjectTermsAcknowledgmentProps) {
  const isReview = variant === "review";
  const termsControl = onOpenTerms ? (
    <button
      type="button"
      className="client-post-project-terms-link"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpenTerms();
      }}
    >
      {POST_PROJECT_OFF_PLATFORM_ACK_LINK}
    </button>
  ) : (
    <Link
      href="/terms"
      target="_blank"
      rel="noreferrer"
      className="client-post-project-terms-link"
      onClick={(event) => event.stopPropagation()}
    >
      {POST_PROJECT_OFF_PLATFORM_ACK_LINK}
    </Link>
  );

  if (isReview) {
    return (
      <div className="client-post-project-terms-row">
        <button
          type="button"
          className={cn(
            "client-post-project-terms-checkbox",
            "client-post-project-terms-checkbox--opens-modal",
          )}
          onClick={() => onOpenTerms?.()}
          aria-label="Open terms and conditions"
        >
          <span
            className={cn(
              "client-post-project-terms-checkbox-indicator",
              acknowledged && "client-post-project-terms-checkbox-indicator--checked",
            )}
            aria-hidden
          />
          <span className="client-post-project-terms-checkbox-copy">
            {POST_PROJECT_OFF_PLATFORM_ACK_BEFORE}
            <span className="client-post-project-terms-link">{POST_PROJECT_OFF_PLATFORM_ACK_LINK}</span>
            {POST_PROJECT_OFF_PLATFORM_ACK_AFTER}
          </span>
        </button>
        <p className="client-post-project-terms-hint">
          Read the full{" "}
          <Link href="/terms" target="_blank" rel="noreferrer" className="client-post-project-terms-link">
            {POST_PROJECT_OFF_PLATFORM_ACK_LINK}
          </Link>{" "}
          page anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="client-post-project-terms-checkbox client-post-project-terms-checkbox--modal">
      <input
        id="post-project-terms-ack"
        type="checkbox"
        checked={acknowledged}
        onChange={(e) => onAcknowledgedChange?.(e.target.checked)}
      />
      <label
        htmlFor="post-project-terms-ack"
        className="client-post-project-terms-checkbox-copy"
      >
        {POST_PROJECT_OFF_PLATFORM_ACK_BEFORE}
      </label>
      {termsControl}
      <label
        htmlFor="post-project-terms-ack"
        className="client-post-project-terms-checkbox-copy"
      >
        {POST_PROJECT_OFF_PLATFORM_ACK_AFTER}
      </label>
    </div>
  );
}
