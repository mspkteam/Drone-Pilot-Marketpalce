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
    <div className="rounded-lg border border-border bg-background p-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
        Registration closed
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-foreground">
        New accounts are paused
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {REGISTRATION_CLOSED_MESSAGE}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/waitlist"
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-gold px-5 text-sm font-semibold text-cta-dark hover:bg-gold-soft"
        >
          Join the waitlist
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-gold/40 px-5 text-sm font-semibold text-gold hover:bg-gold/10"
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
        <div className="rounded-lg border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
