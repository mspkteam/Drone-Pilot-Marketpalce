import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-authenticated";

export const metadata = { title: "Register" };

export default async function RegisterPage() {
  await redirectIfAuthenticated();
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
