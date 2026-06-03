"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { PilotCertificateDto } from "@/types/certificate";

export function PilotCertificatesPanel() {
  const [certificates, setCertificates] = useState<PilotCertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot/certificates");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load certificates.");
        setCertificates([]);
      } else {
        setCertificates(data.certificates ?? []);
      }
    } catch {
      setError("Failed to load certificates.");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
        Refresh
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading certificates…</p>
      ) : certificates.length === 0 ? (
        <p className="empty-state">
          No certificates issued yet. Admins assign platform certificates after
          review.
        </p>
      ) : (
        <ul className="list-panel">
          {certificates.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{c.templateName}</p>
                <p className="text-sm text-muted-foreground">
                  {c.certificateNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  Issued {new Date(c.issuedAt).toLocaleDateString()}
                </p>
                {c.notes ? (
                  <p className="mt-1 text-sm text-muted-foreground">{c.notes}</p>
                ) : null}
              </div>
              <Button
                href={`/api/pilot/certificates/${c.id}/download`}
                size="sm"
              >
                Download PDF
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
