"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminCmsStatusBadge } from "@/components/admin/cms/AdminCmsStatusBadge";
import type { CmsAudience, CmsResource, CmsResourceType, CmsStatus } from "@/types/cms";
import { CMS_AUDIENCES, CMS_RESOURCE_TYPES, CMS_STATUSES } from "@/types/cms";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatResourceType(type: CmsResourceType): string {
  return type.replace(/_/g, " ").toUpperCase();
}

export function AdminCmsResourcesList() {
  const [resources, setResources] = useState<CmsResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CmsStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<CmsResourceType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState<CmsAudience | "all">("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cms/resources");
      const json = (await res.json()) as { resources?: CmsResource[]; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to load resources.");
        setResources([]);
      } else {
        setResources(json.resources ?? []);
      }
    } catch {
      setError("Failed to load resources.");
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    return [...new Set(resources.map((resource) => resource.category))].sort();
  }, [resources]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      if (statusFilter !== "all" && resource.status !== statusFilter) return false;
      if (typeFilter !== "all" && resource.resourceType !== typeFilter) return false;
      if (categoryFilter !== "all" && resource.category !== categoryFilter) return false;
      if (audienceFilter !== "all" && resource.audience !== audienceFilter) return false;
      if (featuredOnly && !resource.featured) return false;
      if (!query) return true;
      return (
        resource.title.toLowerCase().includes(query) ||
        resource.slug.toLowerCase().includes(query)
      );
    });
  }, [
    resources,
    search,
    statusFilter,
    typeFilter,
    categoryFilter,
    audienceFilter,
    featuredOnly,
  ]);

  async function archiveResource(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/cms/resources/${id}`, {
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
    return <p className="admin-cms-loading">Loading resources…</p>;
  }

  return (
    <div className="admin-cms-page">
      <section className="admin-cms-hero admin-ops-bracket-card" aria-label="Resources">
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-cms-hero-inner">
          <div className="admin-cms-hero-copy">
            <p className="admin-ops-eyebrow">CMS / RESOURCES</p>
            <h1 className="admin-cms-hero-title">Resources</h1>
            <p className="admin-cms-hero-desc">
              Manage downloadable files, guides, templates and training materials.
            </p>
          </div>
          <Link href="/dashboard/admin/cms/resources/new" className="admin-cms-btn-gold">
            ADD RESOURCE
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
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as CmsResourceType | "all")
          }
        >
          <option value="all">All types</option>
          {CMS_RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {formatResourceType(type)}
            </option>
          ))}
        </select>
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

      <section className="admin-cms-table-panel" aria-label="Resources list">
        <div className="admin-cms-table-wrap">
          <table className="admin-cms-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
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
                  <td colSpan={7} className="admin-cms-table-empty">
                    No resources match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((resource) => (
                  <tr key={resource.id}>
                    <td>
                      <p className="admin-cms-table-title">{resource.title}</p>
                      <p className="admin-cms-table-sub">{resource.slug}</p>
                    </td>
                    <td className="admin-cms-table-muted">
                      {formatResourceType(resource.resourceType)}
                    </td>
                    <td>{resource.category}</td>
                    <td className="admin-cms-table-muted">{resource.audience}</td>
                    <td>
                      <AdminCmsStatusBadge status={resource.status} />
                    </td>
                    <td className="admin-cms-table-muted">
                      {formatDate(resource.updatedAt)}
                    </td>
                    <td>
                      <div className="admin-cms-row-actions">
                        {resource.externalUrl ? (
                          <a
                            href={resource.externalUrl}
                            className="admin-cms-link-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Preview
                          </a>
                        ) : (
                          <span className="admin-cms-link-btn admin-cms-link-btn--muted">
                            Preview
                          </span>
                        )}
                        <Link
                          href={`/dashboard/admin/cms/resources/${resource.id}/edit`}
                          className="admin-cms-link-btn"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="admin-cms-link-btn admin-cms-link-btn--danger"
                          onClick={() => void archiveResource(resource.id)}
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
