"use client";

import Link from "next/link";
import { useState } from "react";
import { PilotPortfolioAddModal, type PilotPortfolioDraft } from "./PilotPortfolioAddModal";
import { PilotPortfolioCard } from "./PilotPortfolioCard";
import {
  PILOT_PORTFOLIO_MOCK,
  PILOT_PORTFOLIO_ROUTES,
  type PilotPortfolioItem,
} from "@/lib/pilot/portfolio-mock";

export function PilotPortfolioView() {
  const [items, setItems] = useState<PilotPortfolioItem[]>([...PILOT_PORTFOLIO_MOCK]);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSaveItem(draft: PilotPortfolioDraft) {
    const newItem: PilotPortfolioItem = {
      id: `local-${Date.now()}`,
      type: draft.type,
      title: draft.title,
      tags: draft.tags.length > 0 ? draft.tags : ["PORTFOLIO"],
      thumbnailUrl: draft.thumbnailUrl,
      description: draft.description || undefined,
    };
    setItems((current) => [newItem, ...current]);
    setSuccess(`"${draft.title}" added to your gallery (local preview only).`);
  }

  return (
    <div className="pilot-portfolio-page">
      <Link href={PILOT_PORTFOLIO_ROUTES.profile} className="pilot-portfolio-back">
        ← Back
      </Link>

      <header className="pilot-portfolio-header">
        <p className="pilot-portfolio-eyebrow">PILOT / PORTFOLIO</p>
        <h1 className="pilot-portfolio-title-main">Portfolio / Flight Gallery</h1>
      </header>

      <div className="pilot-portfolio-intro">
        <p className="pilot-portfolio-intro-text">
          Showcase your best work to clients browsing the marketplace.
        </p>
        <button
          type="button"
          className="pilot-portfolio-add-btn"
          onClick={() => setModalOpen(true)}
        >
          Add Item
        </button>
      </div>

      {success ? (
        <p className="pilot-portfolio-banner" role="status">
          {success}
        </p>
      ) : null}

      <div className="pilot-portfolio-grid">
        {items.map((item) => (
          <PilotPortfolioCard key={item.id} item={item} />
        ))}
      </div>

      <PilotPortfolioAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
      />
    </div>
  );
}
