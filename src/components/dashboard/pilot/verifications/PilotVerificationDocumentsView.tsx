"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PilotVerificationDocumentCardView } from "./PilotVerificationDocumentCard";
import {
  catalogTag,
  computeVerificationProgress,
  mapVerificationsToDocumentCards,
  type PilotVerificationDocumentCard,
} from "@/lib/pilot/verification-documents-catalog";
import { VERIFICATION_MAX_BYTES } from "@/lib/verification/constants";
import type { VerificationDto } from "@/types/verification";

function DocumentStackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.35" aria-hidden>
      <path d="M4.5 4.5h10.5l2 2v11.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V4.5z" />
      <path d="M14 4.5V7h2.5M7.5 10.5h7M7.5 13.5h5" strokeLinecap="round" />
    </svg>
  );
}

export function PilotVerificationDocumentsView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [verifications, setVerifications] = useState<VerificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingCatalogId, setUploadingCatalogId] = useState<string | null>(null);
  const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot/verifications");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load verifications.");
        setVerifications([]);
      } else {
        setVerifications((data.verifications ?? []) as VerificationDto[]);
      }
    } catch {
      setError("Failed to load verifications.");
      setVerifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cards: PilotVerificationDocumentCard[] = useMemo(
    () => mapVerificationsToDocumentCards(verifications),
    [verifications],
  );

  const progress = useMemo(() => computeVerificationProgress(cards), [cards]);

  function openFilePicker(catalogId: string) {
    setActiveCatalogId(catalogId);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(file: File | undefined) {
    if (!file || !activeCatalogId) return;

    const card = cards.find((c) => c.catalogId === activeCatalogId);
    if (!card) return;

    if (file.size > VERIFICATION_MAX_BYTES) {
      setError("File must be 5 MB or smaller.");
      setActiveCatalogId(null);
      return;
    }

    setUploadingCatalogId(activeCatalogId);
    setError(null);
    setSuccess(null);

    const notes = `${catalogTag(activeCatalogId)} ${card.title}`;

    try {
      const formData = new FormData();
      formData.set("type", card.apiType);
      formData.set("file", file);
      formData.set("notes", notes);

      const res = await fetch("/api/pilot/verifications", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
      } else {
        setSuccess(`${card.title} submitted for admin review.`);
        await load();
      }
    } catch {
      setError("Upload failed.");
    } finally {
      setUploadingCatalogId(null);
      setActiveCatalogId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="pilot-verification-page">
      <Link href="/dashboard/pilot/profile" className="pilot-verification-back">
        ← Back
      </Link>

      <header className="pilot-verification-header">
        <p className="pilot-verification-eyebrow">PILOT / VERIFICATION</p>
        <h1 className="pilot-verification-title">Identity &amp; License Verification</h1>
      </header>

      <div className="pilot-verification-notice">
        <div className="pilot-verification-notice-copy">
          <span className="pilot-verification-notice-icon">
            <DocumentStackIcon />
          </span>
          <div>
            <p className="pilot-verification-notice-main">{progress.pendingActionLabel}</p>
            <p className="pilot-verification-notice-sub">
              Complete your verification to unlock A-4+ missions and remove proposal limits.
            </p>
          </div>
        </div>
        <span className="pilot-verification-progress-badge">
          {progress.completePct}% COMPLETE
        </span>
      </div>

      {error ? (
        <p className="pilot-verification-banner pilot-verification-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="pilot-verification-banner" role="status">
          {success}
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        className="pilot-verification-hidden-input"
        onChange={(e) => void handleFileSelected(e.target.files?.[0])}
      />

      {loading ? (
        <p className="pilot-verification-loading">Loading documents…</p>
      ) : (
        <div className="pilot-verification-grid">
          {cards.map((card) => (
            <PilotVerificationDocumentCardView
              key={card.catalogId}
              card={card}
              uploading={uploadingCatalogId === card.catalogId}
              onReplace={() => openFilePicker(card.catalogId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
