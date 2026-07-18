"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCmsCollectionCard } from "@/components/admin/cms/AdminCmsCollectionCard";
import type { CmsEngineOverviewDto } from "@/types/cms";

export function AdminCmsOverviewPortal() {
  const [data, setData] = useState<CmsEngineOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cms-engine");
      const json = (await res.json()) as CmsEngineOverviewDto & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to load CMS overview.");
        setData(null);
      } else {
        setData(json);
      }
    } catch {
      setError("Failed to load CMS overview.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="admin-cms-loading">Loading CMS…</p>;
  }

  const stats = data?.stats;

  return (
    <div className="admin-cms-page">
      <section className="admin-cms-hero admin-ops-bracket-card" aria-label="CMS overview">
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-cms-hero-inner">
          <div className="admin-cms-hero-copy">
            <p className="admin-ops-eyebrow">CONTENT COMMAND</p>
            <h1 className="admin-cms-hero-title">CMS Pages</h1>
            <p className="admin-cms-hero-desc">
              Manage marketplace articles and resources from one aviation-grade content
              system.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <p className="admin-cms-banner admin-cms-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {data && data.persistenceMode !== "persisted" ? (
        <p className="admin-cms-banner admin-cms-banner--info" role="status">
          CMS persistence is running in preview mode. Changes are stored temporarily
          until the database is connected.
        </p>
      ) : null}

      {stats ? (
        <section className="admin-cms-stats-grid" aria-label="CMS metrics">
          <article className="admin-cms-stat-card">
            <p className="admin-cms-stat-label">ARTICLES</p>
            <p className="admin-cms-stat-value">{stats.articleCount}</p>
          </article>
          <article className="admin-cms-stat-card">
            <p className="admin-cms-stat-label">RESOURCES</p>
            <p className="admin-cms-stat-value">{stats.resourceCount}</p>
          </article>
          <article className="admin-cms-stat-card">
            <p className="admin-cms-stat-label">PUBLISHED</p>
            <p className="admin-cms-stat-value">{stats.publishedCount}</p>
          </article>
          <article className="admin-cms-stat-card">
            <p className="admin-cms-stat-label">DRAFTS</p>
            <p className="admin-cms-stat-value">{stats.draftCount}</p>
          </article>
        </section>
      ) : null}

      {data ? (
        <section className="admin-cms-collections-grid" aria-label="CMS collections">
          <AdminCmsCollectionCard
            title="Articles"
            description="Knowledge center posts, guides, help articles, and operational explainers."
            stats={data.articles}
            manageHref="/dashboard/admin/cms/articles"
            addHref="/dashboard/admin/cms/articles/new"
            manageLabel="Manage Articles"
            addLabel="Add New"
          />
          <AdminCmsCollectionCard
            title="Resources"
            description="Downloadable PDFs, checklists, templates, training material, and external links."
            stats={data.resources}
            manageHref="/dashboard/admin/cms/resources"
            addHref="/dashboard/admin/cms/resources/new"
            manageLabel="Manage Resources"
            addLabel="Add New"
          />
        </section>
      ) : null}
    </div>
  );
}
