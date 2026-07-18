"use client";

import { useRef, useState } from "react";

type AdminCmsMediaFieldProps = {
  id: string;
  label: string;
  kind: "image" | "file";
  module: "cmsArticles" | "cmsResources";
  value: string | null;
  onChange: (url: string | null) => void;
  nameHint?: string;
  placeholder?: string;
};

export function AdminCmsMediaField({
  id,
  label,
  kind,
  module,
  value,
  onChange,
  nameHint,
  placeholder,
}: AdminCmsMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      body.append("module", module);
      if (nameHint) body.append("name", nameHint);

      const res = await fetch("/api/admin/cms/upload", {
        method: "POST",
        body,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error ?? "Upload failed.");
        return;
      }
      setImgFailed(false);
      onChange(json.url);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const accept = kind === "image" ? "image/*" : ".pdf,image/*";
  const showPreview = kind === "image" && !!value && !imgFailed;

  return (
    <div className="admin-cms-field">
      <label htmlFor={id}>{label}</label>
      <div className="admin-cms-media-row">
        <input
          id={id}
          value={value ?? ""}
          onChange={(event) => {
            setImgFailed(false);
            onChange(event.target.value || null);
          }}
          placeholder={placeholder ?? "https://… or upload"}
        />
        <button
          type="button"
          className="admin-cms-btn-outline admin-cms-media-upload"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>
      {showPreview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value ?? ""}
          alt=""
          className="admin-cms-media-preview"
          onError={() => setImgFailed(true)}
        />
      ) : null}
      {kind === "file" && value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="admin-cms-media-filelink"
        >
          View uploaded file
        </a>
      ) : null}
      {error ? (
        <p className="admin-cms-media-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
