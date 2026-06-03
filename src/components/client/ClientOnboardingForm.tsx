"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClientProfileFormFields,
  clientFormToPayload,
  emptyClientFormState,
  type ClientFormState,
} from "@/components/client/ClientProfileFormFields";
import { Button } from "@/components/ui/Button";

export function ClientOnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState<ClientFormState>(emptyClientFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/client/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientFormToPayload(form, true)),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save profile.");
      return;
    }

    router.push("/dashboard/client?onboarding=complete");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <ClientProfileFormFields
        form={form}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        disabled={loading}
      />

      <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
        {loading ? "Saving…" : "Complete setup"}
      </Button>
    </form>
  );
}
