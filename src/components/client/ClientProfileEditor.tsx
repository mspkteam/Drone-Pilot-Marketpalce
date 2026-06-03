"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClientProfileFormFields,
  clientDtoToFormState,
  clientFormToPayload,
  type ClientFormState,
} from "@/components/client/ClientProfileFormFields";
import { Button } from "@/components/ui/Button";
import { getClientProfileStatusLabel } from "@/lib/client/status";
import type { ClientProfileDto } from "@/types/client";

type ClientProfileEditorProps = {
  profile: ClientProfileDto;
};

export function ClientProfileEditor({ profile }: ClientProfileEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<ClientFormState>(() =>
    clientDtoToFormState(profile),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canEdit = profile.status !== "suspended";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await fetch("/api/client/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientFormToPayload(form, false)),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save profile.");
      return;
    }

    setSuccess("Profile saved successfully.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <span className="inline-block rounded-full bg-gold/15 px-3 py-0.5 text-xs font-medium text-gold-dark">
        {getClientProfileStatusLabel(profile.status)}
      </span>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error ? (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {success ? (
          <p
            className="rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-gold-dark"
            role="status"
          >
            {success}
          </p>
        ) : null}

        <ClientProfileFormFields
          form={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          disabled={loading || !canEdit}
        />

        {canEdit ? (
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        ) : null}
      </form>
    </div>
  );
}
