"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  SUPPORT_ALLOWED_MIME_TYPES,
  SUPPORT_MAX_BYTES,
} from "@/lib/support/constants";
import { cn } from "@/lib/utils";

const ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
].join(",");

const MIME_LABELS: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "application/pdf": "PDF",
};

type SupportAttachmentUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
};

function validateClientFile(file: File): string | null {
  if (!(SUPPORT_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return `Unsupported file type. Allowed: ${Object.values(MIME_LABELS).join(", ")}.`;
  }
  if (file.size > SUPPORT_MAX_BYTES) {
    return `File must be ${SUPPORT_MAX_BYTES / (1024 * 1024)} MB or smaller.`;
  }
  return null;
}

function IconPaperclip({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m18.375 12.739-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.106L8.56 18.046a1.5 1.5 0 102.122 2.122l9.525-9.525"
      />
    </svg>
  );
}

export function SupportAttachmentUpload({
  file,
  onFileChange,
  disabled = false,
  label = "Attach image",
  className,
}: SupportAttachmentUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file?.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function applyFile(next: File | null) {
    if (!next) {
      setError(null);
      onFileChange(null);
      return;
    }
    const err = validateClientFile(next);
    if (err) {
      setError(err);
      onFileChange(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError(null);
    onFileChange(next);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => applyFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-gold/45 bg-surface px-3 py-2 text-xs font-medium text-gold-light transition-colors hover:border-gold hover:bg-gold/10 disabled:opacity-50"
        >
          <IconPaperclip className="h-4 w-4 shrink-0 text-gold" />
          {label}
        </button>
        <span className="text-[10px] text-muted-foreground">
          JPG, PNG, WebP, PDF · max 5 MB
        </span>
      </div>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {file ? (
        <div className="rounded-lg border border-border bg-surface/80 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {file.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                applyFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="shrink-0 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            >
              Remove
            </button>
          </div>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Attachment preview"
              className="mt-3 max-h-28 w-full rounded-md border border-border object-cover"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
