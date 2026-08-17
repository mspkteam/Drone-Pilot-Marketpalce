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

  async function handleSaveItem(draft: PilotPortfolioDraft) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(PORTFOLIO_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save portfolio item.");
      } else {
        setSuccess(`"${draft.title}" added to your gallery.`);
        setModalOpen(false);
        await load();
      }
    } catch {
      setError("Failed to save portfolio item.");
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
        </p>
        <button
          type="button"
          className="pilot-portfolio-add-btn"
          onClick={() => setModalOpen(true)}
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
            <PilotPortfolioCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <PilotPortfolioAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(draft) => void handleSaveItem(draft)}
      />
    </div>
  );
}
