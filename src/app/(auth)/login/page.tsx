import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
