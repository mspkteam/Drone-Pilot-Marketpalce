import { Suspense } from "react";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

export const metadata = {
  title: "Join the waitlist",
  description:
    "Get early access updates for Drone Pilot Marketplace launches in your region.",
};

export default function WaitlistPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-border bg-background p-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <WaitlistForm />
    </Suspense>
  );
}
