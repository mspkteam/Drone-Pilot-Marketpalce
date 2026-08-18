import Link from "next/link";

type PilotVerificationTabsProps = {
  active: "documents" | "request-wings";
};

export function PilotVerificationTabs({ active }: PilotVerificationTabsProps) {
  return (
    <nav className="pilot-verification-tabs" aria-label="Verification sections">
      <Link
        href="/dashboard/pilot/verifications"
        className={`pilot-verification-tab${active === "documents" ? " is-active" : ""}`}
        aria-current={active === "documents" ? "page" : undefined}
      >
        Documents
      </Link>
      <Link
        href="/dashboard/pilot/verifications/request-wings"
        className={`pilot-verification-tab${active === "request-wings" ? " is-active" : ""}`}
        aria-current={active === "request-wings" ? "page" : undefined}
      >
        Request Wings
      </Link>
    </nav>
  );
}
