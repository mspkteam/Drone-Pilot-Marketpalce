export function PricingFeatureIcon({ included }: { included: boolean }) {
  if (included) {
    return (
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(216,179,57,0.15)] text-gold"
        aria-hidden
      >
        <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
          <path
            d="M2.5 6l2.25 2.25L9.5 3.5"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[rgba(168,162,154,0.35)]"
      aria-hidden
    >
      <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
        <path
          d="M3 6h6"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
