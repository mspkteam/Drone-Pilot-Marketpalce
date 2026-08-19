"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PilotPortfolioAddModal } from "./PilotPortfolioAddModal";
import { PilotPortfolioCard } from "./PilotPortfolioCard";
import {
  type PilotPortfolioDraft,
  type PilotPortfolioItem,
} from "@/lib/pilot/portfolio";

const PORTFOLIO_API = "/api/pilot/portfolio" as const;

export function PilotPortfolioView() {
  const [items, setItems] = useState<PilotPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PilotPortfolioItem | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PilotPortfolioItem | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PORTFOLIO_API);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load portfolio.");
        setItems([]);
      } else {
        setItems(data.items ?? []);
      }
    } catch {
      setError("Failed to load portfolio.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openAdd() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEdit(item: PilotPortfolioItem) {
    setEditingItem(item);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingItem(null);
  }

  async function handleSaveItem(draft: PilotPortfolioDraft) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const editingId = editingItem?.id;
    try {
      const res = await fetch(
        editingId ? `${PORTFOLIO_API}/${editingId}` : PORTFOLIO_API,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save portfolio item.");
        return;
      }
      setSuccess(
        editingId
          ? `"${draft.title}" was updated.`
          : `"${draft.title}" added to your gallery.`,
      );
      setModalOpen(false);
      setEditingItem(null);
      await load();
    } catch {
      setError("Failed to save portfolio item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveItem(item: PilotPortfolioItem) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${PORTFOLIO_API}/${item.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to remove portfolio item.");
        return;
      }
      setPendingRemove(null);
      setSuccess(`"${item.title}" was removed from your gallery.`);
      await load();
    } catch {
      setError("Failed to remove portfolio item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pilot-portfolio-page">
      <header className="pilot-portfolio-header pilot-portfolio-bracket-card">
        <p className="pilot-portfolio-eyebrow">PILOT / PORTFOLIO</p>
        <h1 className="pilot-portfolio-title-main">Portfolio / Flight Gallery</h1>
      </header>

      <div className="pilot-portfolio-intro pilot-portfolio-bracket-card">
        <p className="pilot-portfolio-intro-text">
          Showcase your best work to clients browsing the marketplace. Gallery items
          appear on your{" "}
          <Link href="/dashboard/pilot/profile">Pilot Profile</Link> and public listing.
          Edit or remove any item at any time.
        </p>
        <button
          type="button"
          className="pilot-portfolio-add-btn"
          onClick={openAdd}
          disabled={saving}
        >
          Add Item
        </button>
      </div>

      {error ? (
        <p className="pilot-portfolio-banner pilot-portfolio-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="pilot-portfolio-banner" role="status">
          {success}
        </p>
      ) : null}

      {loading ? (
        <p className="pilot-portfolio-loading">Loading portfolio…</p>
      ) : items.length === 0 ? (
        <p className="pilot-portfolio-empty">
          No portfolio items yet. Add your first flight gallery entry to strengthen your
          profile.
        </p>
      ) : (
        <div className="pilot-portfolio-grid">
          {items.map((item) => (
            <PilotPortfolioCard
              key={item.id}
              item={item}
              busy={saving}
              onEdit={openEdit}
              onRemove={setPendingRemove}
            />
          ))}
        </div>
      )}

      <PilotPortfolioAddModal
        open={modalOpen}
        item={editingItem}
        saving={saving}
        onClose={closeModal}
        onSave={(draft) => void handleSaveItem(draft)}
      />

      {pendingRemove ? (
        <div
          className="pilot-portfolio-modal-backdrop"
          role="presentation"
          onClick={() => {
            if (!saving) setPendingRemove(null);
          }}
        >
          <div
            className="pilot-portfolio-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="pilot-portfolio-remove-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="pilot-portfolio-remove-title" className="pilot-portfolio-modal-title">
              Remove this item?
            </h2>
            <p className="pilot-portfolio-modal-sub">
              “{pendingRemove.title}” will be removed from your gallery and public
              profile. This cannot be undone.
            </p>
            <div className="pilot-portfolio-modal-actions">
              <button
                type="button"
                className="pilot-portfolio-btn-outline"
                onClick={() => setPendingRemove(null)}
                disabled={saving}
              >
                Keep item
              </button>
              <button
                type="button"
                className="pilot-portfolio-btn-danger"
                onClick={() => void handleRemoveItem(pendingRemove)}
                disabled={saving}
              >
                {saving ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
