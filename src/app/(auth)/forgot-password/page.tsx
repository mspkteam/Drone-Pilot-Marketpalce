import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
