import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";
import {
  isRegistrationEnabled,
  REGISTRATION_CLOSED_MESSAGE,
} from "@/lib/auth/registration-gate";

export const metadata = { title: "Register" };

function RegistrationClosedPanel() {
  return (
    <div className="ras-auth-card text-center">
      <p className="ras-panel-title">Registration closed</p>
      <h1 className="ras-panel-heading mt-3">New accounts are paused</h1>
      <p className="ras-help mx-auto max-w-md">
        {REGISTRATION_CLOSED_MESSAGE}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/waitlist"
          className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-gold)] px-5 text-sm font-semibold text-[var(--color-cta-dark)] hover:bg-[var(--color-gold-soft)]"
        >
          Join the waitlist
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-control)] border border-[rgba(216,179,57,0.4)] px-5 text-sm font-semibold text-[var(--color-gold)] hover:bg-[rgba(216,179,57,0.1)]"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default async function RegisterPage() {
  await redirectIfAuthenticated();

  if (!isRegistrationEnabled()) {
    return <RegistrationClosedPanel />;
  }

  return (
    <Suspense
      fallback={
        <div className="ras-auth-card text-center ras-muted text-sm">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
