"use client";

import { useEffect, useRef, useState } from "react";
import {
  parsePortfolioTags,
  type PilotPortfolioDraft,
  type PilotPortfolioItem,
  type PilotPortfolioMediaType,
} from "@/lib/pilot/portfolio";

type PilotPortfolioAddModalProps = {
  open: boolean;
  item?: PilotPortfolioItem | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (draft: PilotPortfolioDraft) => void;
};

const EMPTY_DRAFT: PilotPortfolioDraft = {
  title: "",
  type: "VIDEO",
  tags: [],
  description: "",
  thumbnailUrl: null,
};

export function PilotPortfolioAddModal({
  open,
  item = null,
  saving = false,
  onClose,
  onSave,
}: PilotPortfolioAddModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [draft, setDraft] = useState<PilotPortfolioDraft>(EMPTY_DRAFT);
  const [tagsInput, setTagsInput] = useState("");
  const isEdit = Boolean(item);

  useEffect(() => {
    if (!open) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setDraft(EMPTY_DRAFT);
      setTagsInput("");
      return;
    }

    if (item) {
      setDraft({
        title: item.title,
        type: item.type,
        tags: item.tags,
        description: item.description ?? "",
        thumbnailUrl: item.thumbnailUrl,
      });
      setTagsInput(item.tags.join(", "));
      return;
    }

    setDraft(EMPTY_DRAFT);
    setTagsInput("");
  }, [open, item]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, saving, onClose]);

  if (!open) return null;

  function handleSave() {
    const title = draft.title.trim();
    if (!title || saving) return;

    onSave({
      ...draft,
      title,
      tags: parsePortfolioTags(tagsInput),
    });
  }

  function handleFileChange(file: File | undefined) {
    if (!file) return;
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    blobUrlRef.current = nextUrl;
    setDraft((current) => ({ ...current, thumbnailUrl: nextUrl }));
  }

  return (
    <div
      className="pilot-portfolio-modal-backdrop"
      role="presentation"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className="pilot-portfolio-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pilot-portfolio-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="pilot-portfolio-modal-title" className="pilot-portfolio-modal-title">
          {isEdit ? "Edit portfolio item" : "Add portfolio item"}
        </h2>
        <p className="pilot-portfolio-modal-sub">
          {isEdit
            ? "Update the title, type, tags, or preview. Changes appear on your public profile."
            : "Add a flight gallery item. It appears on your profile and public listing."}
        </p>

        <div className="pilot-portfolio-modal-fields">
          <label className="pilot-portfolio-field">
            <span className="pilot-portfolio-label">Title</span>
            <input
              className="pilot-portfolio-input"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Alpine Tower Inspection"
              autoFocus
            />
          </label>

          <label className="pilot-portfolio-field">
            <span className="pilot-portfolio-label">Type</span>
            <select
              className="pilot-portfolio-input"
              value={draft.type}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  type: e.target.value as PilotPortfolioMediaType,
                }))
              }
            >
              <option value="VIDEO">Video</option>
              <option value="PHOTOSET">Photoset</option>
            </select>
          </label>

          <label className="pilot-portfolio-field">
            <span className="pilot-portfolio-label">Tags (comma-separated)</span>
            <input
              className="pilot-portfolio-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="THERMAL, INSPECTION"
            />
          </label>

          <label className="pilot-portfolio-field">
            <span className="pilot-portfolio-label">Description (optional)</span>
            <textarea
              className="pilot-portfolio-textarea"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={3}
            />
          </label>

          <div className="pilot-portfolio-field">
            <span className="pilot-portfolio-label">Preview image</span>
            {draft.thumbnailUrl ? (
              <div className="pilot-portfolio-modal-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.thumbnailUrl} alt="" />
                <button
                  type="button"
                  className="pilot-portfolio-btn-ghost"
                  onClick={() =>
                    setDraft((current) => ({ ...current, thumbnailUrl: null }))
                  }
                  disabled={saving}
                >
                  Remove preview
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className="pilot-portfolio-upload-placeholder"
              onClick={() => fileRef.current?.click()}
              disabled={saving}
            >
              {draft.thumbnailUrl ? "Change preview image" : "Choose image preview"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="pilot-portfolio-hidden-input"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="pilot-portfolio-modal-actions">
          <button
            type="button"
            className="pilot-portfolio-btn-outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pilot-portfolio-btn-gold"
            onClick={handleSave}
            disabled={!draft.title.trim() || saving}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save item"}
          </button>
        </div>
      </div>
    </div>
  );
}
