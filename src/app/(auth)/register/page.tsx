import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Register" };

export default function RegisterPage() {
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
