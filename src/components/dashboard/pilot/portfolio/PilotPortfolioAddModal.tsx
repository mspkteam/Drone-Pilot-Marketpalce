"use client";

import { useEffect, useRef, useState } from "react";
import {
  parsePortfolioTags,
  type PilotPortfolioDraft,
  type PilotPortfolioMediaType,
} from "@/lib/pilot/portfolio";

type PilotPortfolioAddModalProps = {
  open: boolean;
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
  onClose,
  onSave,
}: PilotPortfolioAddModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<PilotPortfolioDraft>(EMPTY_DRAFT);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (!open) {
      setDraft(EMPTY_DRAFT);
      setTagsInput("");
    }
  }, [open]);

  if (!open) return null;

  function handleSave() {
    const title = draft.title.trim();
    if (!title) return;

    onSave({
      ...draft,
      title,
      tags: parsePortfolioTags(tagsInput),
    });
    onClose();
  }

  return (
    <div className="pilot-portfolio-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="pilot-portfolio-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pilot-portfolio-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="pilot-portfolio-modal-title" className="pilot-portfolio-modal-title">
          Add portfolio item
        </h2>
        <p className="pilot-portfolio-modal-sub">
          Saved locally for now — upload and persistence pending backend (M109).
        </p>

        <div className="pilot-portfolio-modal-fields">
          <label className="pilot-portfolio-field">
            <span className="pilot-portfolio-label">Title</span>
            <input
              className="pilot-portfolio-input"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Alpine Tower Inspection"
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
            <span className="pilot-portfolio-label">Media</span>
            <button
              type="button"
              className="pilot-portfolio-upload-placeholder"
              onClick={() => fileRef.current?.click()}
            >
              {draft.thumbnailUrl ? "Change preview image" : "Choose image preview"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="pilot-portfolio-hidden-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setDraft((d) => ({
                  ...d,
                  thumbnailUrl: URL.createObjectURL(file),
                }));
              }}
            />
          </div>
        </div>

        <div className="pilot-portfolio-modal-actions">
          <button type="button" className="pilot-portfolio-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="pilot-portfolio-btn-gold"
            onClick={handleSave}
            disabled={!draft.title.trim()}
          >
            Save Item
          </button>
        </div>
      </div>
    </div>
  );
}
