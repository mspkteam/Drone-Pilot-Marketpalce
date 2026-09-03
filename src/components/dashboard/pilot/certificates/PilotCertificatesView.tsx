"use client";

import { useCallback, useEffect, useState } from "react";
import type { PilotCertificateDto } from "@/types/certificate";

export function PilotCertificatesView() {
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
    <div className="pilot-certificates-page">
      <header className="pilot-certificates-header pilot-certificates-bracket-card">
        <p className="pilot-certificates-eyebrow">PILOT / CERTIFICATES</p>
        <h1 className="pilot-certificates-title-main">Certificates</h1>
        <p className="pilot-certificates-lead">
          Download platform certificates issued by admins after review.
        </p>
      </header>

      <section className="pilot-certificates-panel" aria-label="Issued certificates">
        <div className="pilot-certificates-panel-head">
          <h2 className="pilot-certificates-panel-title">ISSUED CERTIFICATES</h2>
          <button
            type="button"
            className="pilot-certificates-refresh"
            onClick={() => void load()}
          >
            Refresh
          </button>
        </div>

        {error ? (
          <p className="pilot-certificates-banner" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="pilot-certificates-loading">Loading certificates…</p>
        ) : certificates.length === 0 ? (
          <p className="pilot-certificates-empty">
            No certificates issued yet. Admins assign platform certificates after
            review.
          </p>
        ) : (
          <ul className="pilot-certificates-list">
            {certificates.map((c) => (
              <li key={c.id} className="pilot-certificates-card">
                <div>
                  <p className="pilot-certificates-card-title">{c.templateName}</p>
                  <p className="pilot-certificates-card-meta">
                    {c.certificateNumber}
                  </p>
                  <p className="pilot-certificates-card-meta">
                    Issued {new Date(c.issuedAt).toLocaleDateString()}
                  </p>
                  {c.notes ? (
                    <p className="pilot-certificates-card-notes">{c.notes}</p>
                  ) : null}
                </div>
                <a
                  className="pilot-certificates-download"
                  href={`/api/pilot/certificates/${c.id}/download`}
                >
                  Download PDF
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
