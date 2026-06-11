export function PinIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden
    >
      <path
        d="M6 1.25c-1.5 0-2.75 1.25-2.75 2.75 0 2.06 2.75 5.5 2.75 5.5s2.75-3.44 2.75-5.5C8.75 2.5 7.5 1.25 6 1.25z"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
      className="client-find-pilots-star"
    >
      <path d="M6 0.5l1.45 4.45h4.7L8.35 8.1l1.45 4.45L6 10.4 2.2 12.55 3.65 8.1.85 4.95h4.7L6 0.5z" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden
    >
      <circle cx="6" cy="6" r="4.75" />
      <path d="M6 3.5V6l1.75 1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VerifiedIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="client-find-pilots-verified"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5.25 8.1l1.9 1.9 3.6-3.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
