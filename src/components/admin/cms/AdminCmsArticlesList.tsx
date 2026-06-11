"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminCmsStatusBadge } from "@/components/admin/cms/AdminCmsStatusBadge";
import type { CmsArticle, CmsAudience, CmsStatus } from "@/types/cms";
import { CMS_AUDIENCES, CMS_STATUSES } from "@/types/cms";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminCmsArticlesList() {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CmsStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState<CmsAudience | "all">("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cms/articles");
      const json = (await res.json()) as { articles?: CmsArticle[]; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to load articles.");
        setArticles([]);
      } else {
        setArticles(json.articles ?? []);
      }
    } catch {
      setError("Failed to load articles.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    return [...new Set(articles.map((article) => article.category))].sort();
  }, [articles]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return articles.filter((article) => {
      if (statusFilter !== "all" && article.status !== statusFilter) return false;
      if (categoryFilter !== "all" && article.category !== categoryFilter) return false;
      if (audienceFilter !== "all" && article.audience !== audienceFilter) return false;
      if (featuredOnly && !article.featured) return false;
      if (!query) return true;
      return (
        article.title.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query)
      );
    });
  }, [articles, search, statusFilter, categoryFilter, audienceFilter, featuredOnly]);

  async function archiveArticle(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/cms/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Archive failed.");
      return;
    }
    await load();
  }

  if (loading) {
    return <p className="admin-cms-loading">Loading articles…</p>;
  }

  return (
    <div className="admin-cms-page">
      <section className="admin-cms-hero admin-ops-bracket-card" aria-label="Articles">
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-cms-hero-inner">
          <div className="admin-cms-hero-copy">
            <p className="admin-ops-eyebrow">CMS / ARTICLES</p>
            <h1 className="admin-cms-hero-title">Articles</h1>
            <p className="admin-cms-hero-desc">
              Create and manage marketplace articles, guides and knowledge content.
            </p>
          </div>
          <Link href="/dashboard/admin/cms/articles/new" className="admin-cms-btn-gold">
            ADD ARTICLE
          </Link>
        </div>
      </section>

      {error ? (
        <p className="admin-cms-banner admin-cms-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-cms-filters">
        <input
          type="search"
          className="admin-cms-filter-input"
          placeholder="Search title or slug…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="admin-cms-filter-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as CmsStatus | "all")}
        >
          <option value="all">All statuses</option>
          {CMS_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          className="admin-cms-filter-select"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          className="admin-cms-filter-select"
          value={audienceFilter}
          onChange={(event) =>
            setAudienceFilter(event.target.value as CmsAudience | "all")
          }
        >
          <option value="all">All audiences</option>
          {CMS_AUDIENCES.map((audience) => (
            <option key={audience} value={audience}>
              {audience}
            </option>
          ))}
        </select>
        <label className="admin-cms-filter-check">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(event) => setFeaturedOnly(event.target.checked)}
          />
          Featured only
        </label>
      </div>

      <section className="admin-cms-table-panel" aria-label="Articles list">
        <div className="admin-cms-table-wrap">
          <table className="admin-cms-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-cms-table-empty">
                    No articles match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <p className="admin-cms-table-title">{article.title}</p>
                      <p className="admin-cms-table-sub">{article.slug}</p>
                    </td>
                    <td>{article.category}</td>
                    <td className="admin-cms-table-muted">{article.audience}</td>
                    <td>
                      <AdminCmsStatusBadge status={article.status} />
                    </td>
                    <td className="admin-cms-table-muted">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td>
                      <div className="admin-cms-row-actions">
                        <Link
                          href={`/resources/${article.slug}`}
                          className="admin-cms-link-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/dashboard/admin/cms/articles/${article.id}/edit`}
                          className="admin-cms-link-btn"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="admin-cms-link-btn admin-cms-link-btn--danger"
                          onClick={() => void archiveArticle(article.id)}
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
