type PilotReviewsStarsProps = {
  value: number;
  className?: string;
};

export function PilotReviewsStars({ value, className = "" }: PilotReviewsStarsProps) {
  return (
    <span
      className={`pilot-reviews-stars ${className}`.trim()}
      aria-label={`${value} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < value ? "pilot-reviews-star pilot-reviews-star--on" : "pilot-reviews-star"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}
