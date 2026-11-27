export const REVIEW_MODERATION_REASON_CODES = [
  "abuse",
  "fraud",
  "off_platform",
  "tos",
  "dispute_void",
] as const;

export type ReviewModerationReasonCode =
  (typeof REVIEW_MODERATION_REASON_CODES)[number];

export const REVIEW_MODERATION_REASON_LABELS: Record<
  ReviewModerationReasonCode,
  string
> = {
  abuse: "Abuse / harassment",
  fraud: "Fraud",
  off_platform: "Off-platform dealing",
  tos: "Terms of Service violation",
  dispute_void: "Voided by dispute",
};

export function isReviewModerationReasonCode(
  value: unknown,
): value is ReviewModerationReasonCode {
  return (
    typeof value === "string" &&
    (REVIEW_MODERATION_REASON_CODES as readonly string[]).includes(value)
  );
}
