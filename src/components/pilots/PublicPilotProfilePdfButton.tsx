"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type PublicPilotProfilePdfButtonProps = {
  pilotId: string;
  displayName: string;
  className?: string;
};

export function PublicPilotProfilePdfButton({
  pilotId,
  displayName,
  className,
}: PublicPilotProfilePdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pilots/${encodeURIComponent(pilotId)}/pdf`, {
        method: "GET",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Could not download profile PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition");
      const matched = disposition?.match(/filename="([^"]+)"/);
      anchor.href = url;
      anchor.download =
        matched?.[1] ??
        `${displayName.trim().toLowerCase().replace(/\s+/g, "-") || "pilot"}-profile.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-[0.875rem] border border-[rgba(216,179,57,0.45)] bg-[rgba(216,179,57,0.1)] px-4 text-sm font-semibold text-gold transition-colors hover:border-gold/60 hover:bg-[rgba(216,179,57,0.16)] hover:text-gold-light disabled:opacity-60"
      >
        <DownloadIcon className="h-4 w-4" />
        {loading ? "Preparing PDF…" : "Download PDF"}
      </button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3"
      />
    </svg>
  );
}
