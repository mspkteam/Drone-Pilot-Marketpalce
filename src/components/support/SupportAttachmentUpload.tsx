"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  SUPPORT_ALLOWED_MIME_TYPES,
  SUPPORT_MAX_ATTACHMENTS,
  SUPPORT_MAX_BYTES,
} from "@/lib/support/constants";
import { cn } from "@/lib/utils";
import "@/styles/support-attachments.css";

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
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  /** Admin dashboard styling hooks */
  variant?: "widget" | "admin";
};

function validateClientFile(file: File): string | null {
  if (!(SUPPORT_ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return `Unsupported file type. Allowed: ${Object.values(MIME_LABELS).join(", ")}.`;
  }
  if (file.size > SUPPORT_MAX_BYTES) {
    return `Each file must be ${SUPPORT_MAX_BYTES / (1024 * 1024)} MB or smaller.`;
  }
  return null;
}

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
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

function ThumbnailTile({
  file,
  onRemove,
  disabled,
  variant,
}: {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
  variant: "widget" | "admin";
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  return (
    <li
      className={cn(
        "support-attach-thumb",
        variant === "admin" && "admin-support-attach-thumb",
      )}
    >
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="support-attach-thumb-img" />
      ) : (
        <span className="support-attach-thumb-file" aria-hidden>
          PDF
        </span>
      )}
      <span className="support-attach-thumb-name" title={file.name}>
        {file.name}
      </span>
      <button
        type="button"
        className={cn(
          "support-attach-thumb-remove",
          variant === "admin" && "admin-support-attach-thumb-remove",
        )}
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
      >
        ×
      </button>
    </li>
  );
}

export function SupportAttachmentUpload({
  files,
  onFilesChange,
  disabled = false,
  label = "Attach files",
  className,
  variant = "widget",
}: SupportAttachmentUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const remaining = SUPPORT_MAX_ATTACHMENTS - files.length;
  const canAddMore = remaining > 0 && !disabled;

  const existingKeys = useMemo(() => new Set(files.map(fileKey)), [files]);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;

    const next = [...files];
    let lastError: string | null = null;

    for (const file of Array.from(list)) {
      if (next.length >= SUPPORT_MAX_ATTACHMENTS) {
        lastError = `You can attach up to ${SUPPORT_MAX_ATTACHMENTS} files.`;
        break;
      }
      const err = validateClientFile(file);
      if (err) {
        lastError = err;
        continue;
      }
      if (existingKeys.has(fileKey(file))) continue;
      next.push(file);
    }

    setError(lastError);
    onFilesChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    setError(null);
    onFilesChange(files.filter((_, i) => i !== index));
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      className={cn(
        "support-attach",
        variant === "admin" && "admin-support-attach",
        className,
      )}
    >
      <div className="support-attach-controls">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          disabled={!canAddMore}
          onChange={(e) => addFiles(e.target.files)}
        />
        <button
          type="button"
          disabled={!canAddMore}
          onClick={() => inputRef.current?.click()}
          className={cn(
            variant === "admin"
              ? "admin-support-attach-btn"
              : "inline-flex items-center gap-2 rounded-lg border border-gold/45 bg-surface px-3 py-2 text-xs font-medium text-gold-light transition-colors hover:border-gold hover:bg-gold/10 disabled:opacity-50",
          )}
        >
          {variant === "widget" ? (
            <IconPaperclip className="h-4 w-4 shrink-0 text-gold" />
          ) : null}
          {label}
        </button>
        <span
          className={cn(
            variant === "admin"
              ? "admin-support-attach-meta"
              : "text-[10px] text-muted-foreground",
          )}
        >
          JPG, PNG, WebP, PDF · max 5 MB · up to {SUPPORT_MAX_ATTACHMENTS}
        </span>
      </div>

      {error ? (
        <p
          className={cn(
            variant === "admin"
              ? "admin-support-alert admin-support-alert--error"
              : "text-xs text-destructive",
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="support-attach-thumbs" aria-label="Selected attachments">
          {files.map((file, index) => (
            <ThumbnailTile
              key={fileKey(file)}
              file={file}
              disabled={disabled}
              variant={variant}
              onRemove={() => removeAt(index)}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Append selected files to FormData as `attachments`. */
export function appendSupportAttachments(formData: FormData, files: File[]) {
  for (const file of files) {
    formData.append("attachments", file);
  }
}
