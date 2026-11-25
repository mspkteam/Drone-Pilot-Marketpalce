import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage() {
  await redirectIfAuthenticated();
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
