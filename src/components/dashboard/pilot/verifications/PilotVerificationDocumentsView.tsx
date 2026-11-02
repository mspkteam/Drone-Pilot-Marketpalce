"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PilotVerificationDocumentCardView } from "./PilotVerificationDocumentCard";
import { PilotVerificationTabs } from "./PilotVerificationTabs";
import {
  LICENSE_PATH_STORAGE_KEY,
  catalogTag,
  computeVerificationProgress,
  isCatalogVisibleForPath,
  isLicensePath,
  mapVerificationsToDocumentCards,
  type PilotLicensePath,
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

function readStoredLicensePath(): PilotLicensePath {
  if (typeof window === "undefined") return "faa";
  const raw = window.localStorage.getItem(LICENSE_PATH_STORAGE_KEY);
  return isLicensePath(raw) ? raw : "faa";
}

export function PilotVerificationDocumentsView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [verifications, setVerifications] = useState<VerificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingCatalogId, setUploadingCatalogId] = useState<string | null>(null);
  const [removingCatalogId, setRemovingCatalogId] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);
  const [licensePath, setLicensePath] = useState<PilotLicensePath>("faa");

  useEffect(() => {
    setLicensePath(readStoredLicensePath());
  }, []);

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

  const visibleCards = useMemo(
    () => cards.filter((card) => isCatalogVisibleForPath(card, licensePath)),
    [cards, licensePath],
  );

  const progress = useMemo(
    () => computeVerificationProgress(cards, licensePath),
    [cards, licensePath],
  );

  function selectLicensePath(path: PilotLicensePath) {
    setLicensePath(path);
    window.localStorage.setItem(LICENSE_PATH_STORAGE_KEY, path);
  }

  function openFilePicker(catalogId: string) {
    setActiveCatalogId(catalogId);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(file: File | undefined) {
    if (!file || !activeCatalogId) return;

    const card = cards.find((c) => c.catalogId === activeCatalogId);
    if (!card) return;

    if (file.size > VERIFICATION_MAX_BYTES) {
      setCardErrors((prev) => ({
        ...prev,
        [activeCatalogId]: "File must be 5 MB or smaller.",
      }));
      setActiveCatalogId(null);
      return;
    }

    const allowed =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";
    if (!allowed) {
      setCardErrors((prev) => ({
        ...prev,
        [activeCatalogId]: "Use PDF, JPG, PNG, or WEBP only.",
      }));
      setActiveCatalogId(null);
      return;
    }

    setUploadingCatalogId(activeCatalogId);
    setError(null);
    setSuccess(null);
    setCardErrors((prev) => {
      const next = { ...prev };
      delete next[activeCatalogId];
      return next;
    });

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
        setCardErrors((prev) => ({
          ...prev,
          [activeCatalogId]: data.error ?? "Upload failed.",
        }));
      } else {
        setSuccess(`${card.title} submitted for admin review.`);
        await load();
      }
    } catch {
      setCardErrors((prev) => ({
        ...prev,
        [activeCatalogId]: "Upload failed.",
      }));
    } finally {
      setUploadingCatalogId(null);
      setActiveCatalogId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove(catalogId: string) {
    const card = cards.find((c) => c.catalogId === catalogId);
    const verificationId = card?.verification?.id;
    if (!verificationId) return;
    if (!window.confirm(`Remove the uploaded file for ${card.title}?`)) return;

    setRemovingCatalogId(catalogId);
    setError(null);
    setSuccess(null);
    setCardErrors((prev) => {
      const next = { ...prev };
      delete next[catalogId];
      return next;
    });
    try {
      const res = await fetch(`/api/pilot/verifications/${verificationId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setCardErrors((prev) => ({
          ...prev,
          [catalogId]: data.error ?? "Could not remove file.",
        }));
        return;
      }
      setSuccess(`${card.title} upload removed.`);
      await load();
    } catch {
      setCardErrors((prev) => ({
        ...prev,
        [catalogId]: "Could not remove file.",
      }));
    } finally {
      setRemovingCatalogId(null);
    }
  }

  return (
    <div className="pilot-verification-page">
      <header className="pilot-verification-header pilot-verification-bracket-card">
        <p className="pilot-verification-eyebrow">PILOT / VERIFICATION</p>
        <h1 className="pilot-verification-title">Identity &amp; License Verification</h1>
        <PilotVerificationTabs active="documents" />
      </header>

      <div className="pilot-verification-notice pilot-verification-bracket-card">
        <div className="pilot-verification-notice-copy">
          <span className="pilot-verification-notice-icon">
            <DocumentStackIcon />
          </span>
          <div>
            <p className="pilot-verification-notice-main">{progress.pendingActionLabel}</p>
            <p className="pilot-verification-notice-sub">
              Required for A-4+: Government ID (front and back), one pilot
              certificate (FAA Part 107 or EASA), and aircraft registration.
              Insurance and other docs stay optional.
            </p>
          </div>
        </div>
        <span className="pilot-verification-progress-badge">
          {progress.completePct}% COMPLETE
        </span>
      </div>

      <section
        className="pilot-verification-path pilot-verification-bracket-card"
        aria-label="Pilot certificate authority"
      >
        <p className="pilot-verification-path-label">
          Pilot certificate path
        </p>
        <p className="pilot-verification-path-hint">
          Most pilots hold FAA or EASA — not both. Choose one path to show the
          matching certificate uploads.
        </p>
        <div className="pilot-verification-path-toggle" role="group">
          <button
            type="button"
            className={`pilot-verification-path-btn${
              licensePath === "faa" ? " is-active" : ""
            }`}
            aria-pressed={licensePath === "faa"}
            onClick={() => selectLicensePath("faa")}
          >
            <span className="pilot-verification-path-btn-title">FAA</span>
            <span className="pilot-verification-path-btn-sub">
              Part 107 remote pilot certificate
            </span>
          </button>
          <button
            type="button"
            className={`pilot-verification-path-btn${
              licensePath === "easa" ? " is-active" : ""
            }`}
            aria-pressed={licensePath === "easa"}
            onClick={() => selectLicensePath("easa")}
          >
            <span className="pilot-verification-path-btn-title">EASA</span>
            <span className="pilot-verification-path-btn-sub">
              Any one EASA class credential
            </span>
          </button>
        </div>
        {licensePath === "easa" ? (
          <p className="pilot-verification-path-hint">
            Upload at least one EASA credential below. Additional EASA classes
            are optional extras.
          </p>
        ) : null}
      </section>

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
          {visibleCards.map((card) => (
            <PilotVerificationDocumentCardView
              key={card.catalogId}
              card={card}
              uploading={uploadingCatalogId === card.catalogId}
              removing={removingCatalogId === card.catalogId}
              cardError={cardErrors[card.catalogId] ?? null}
              onReplace={() => openFilePicker(card.catalogId)}
              onRemove={() => void handleRemove(card.catalogId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
