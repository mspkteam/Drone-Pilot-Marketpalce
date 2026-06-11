"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { CmsArticle, CmsArticleInput, CmsAudience, CmsStatus } from "@/types/cms";
import { CMS_AUDIENCES, CMS_STATUSES } from "@/types/cms";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const emptyArticle = (): CmsArticleInput => ({
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  featuredImage: null,
  category: "General",
  tags: [],
  audience: "public",
  status: "draft",
  featured: false,
  author: "Remote Air Service",
  readTimeMinutes: 3,
  publishedAt: null,
  seoTitle: "",
  seoDescription: "",
  ogImage: null,
  sortOrder: 100,
});

type AdminCmsArticleEditorProps = {
  articleId?: string;
};

export function AdminCmsArticleEditor({ articleId }: AdminCmsArticleEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(articleId);
  const [form, setForm] = useState<CmsArticleInput>(emptyArticle());
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cms/articles/${articleId}`);
      const json = (await res.json()) as { article?: CmsArticle; error?: string };
      if (!res.ok || !json.article) {
        setError(json.error ?? "Article not found.");
        return;
      }
      const { id: _id, createdAt: _c, updatedAt: _u, ...input } = json.article;
      setForm(input);
      setTagsInput(input.tags.join(", "));
    } catch {
      setError("Failed to load article.");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField<K extends keyof CmsArticleInput>(
    key: K,
    value: CmsArticleInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(status: CmsStatus) {
    setSaving(true);
    setError(null);
    setNotice(null);
    const payload: CmsArticleInput = {
      ...form,
      status,
      tags: tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt:
        status === "published"
          ? form.publishedAt ?? new Date().toISOString()
          : form.publishedAt,
      seoTitle: form.seoTitle || form.title,
      seoDescription: form.seoDescription || form.excerpt,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/cms/articles/${articleId}` : "/api/admin/cms/articles",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Save failed.");
        return;
      }
      setNotice(
        "Saved to in-memory preview store. CMS persistence is pending until the backend is connected.",
      );
      if (!isEdit && json.article?.id) {
        router.push(`/dashboard/admin/cms/articles/${json.article.id}/edit`);
      } else {
        await load();
      }
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="admin-cms-loading">Loading article…</p>;
  }

  return (
    <div className="admin-cms-page">
      <section className="admin-cms-editor-head">
        <div>
          <p className="admin-ops-eyebrow">CMS / ARTICLES</p>
          <h1 className="admin-cms-editor-title">
            {isEdit ? "Edit Article" : "New Article"}
          </h1>
        </div>
        <Link href="/dashboard/admin/cms/articles" className="admin-cms-btn-outline">
          Back to list
        </Link>
      </section>

      {error ? (
        <p className="admin-cms-banner admin-cms-banner--error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="admin-cms-banner admin-cms-banner--info" role="status">
          {notice}
        </p>
      ) : null}

      <div className="admin-cms-editor-layout">
        <div className="admin-cms-editor-main">
          <section className="admin-cms-editor-card">
            <div className="admin-cms-field">
              <label htmlFor="article-title">Title</label>
              <input
                id="article-title"
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;
                  updateField("title", title);
                  if (!isEdit || !form.slug) {
                    updateField("slug", slugify(title));
                  }
                }}
                required
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="article-slug">Slug</label>
              <input
                id="article-slug"
                value={form.slug}
                onChange={(event) => updateField("slug", slugify(event.target.value))}
                required
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="article-excerpt">Excerpt</label>
              <textarea
                id="article-excerpt"
                rows={3}
                value={form.excerpt}
                onChange={(event) => updateField("excerpt", event.target.value)}
                required
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="article-body">Body / content</label>
              <textarea
                id="article-body"
                className="admin-cms-body-editor"
                rows={14}
                value={form.body}
                onChange={(event) => updateField("body", event.target.value)}
                required
              />
            </div>
          </section>
        </div>

        <aside className="admin-cms-editor-sidebar">
          <section className="admin-cms-sidebar-card">
            <h2 className="admin-cms-sidebar-title">Publishing</h2>
            <div className="admin-cms-field">
              <label htmlFor="article-status">Status</label>
              <select
                id="article-status"
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as CmsStatus)
                }
              >
                {CMS_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-cms-field">
              <label htmlFor="article-audience">Audience</label>
              <select
                id="article-audience"
                value={form.audience}
                onChange={(event) =>
                  updateField("audience", event.target.value as CmsAudience)
                }
              >
                {CMS_AUDIENCES.map((audience) => (
                  <option key={audience} value={audience}>
                    {audience}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-cms-field">
              <label htmlFor="article-published">Publish date</label>
              <input
                id="article-published"
                type="datetime-local"
                value={
                  form.publishedAt
                    ? form.publishedAt.slice(0, 16)
                    : ""
                }
                onChange={(event) =>
                  updateField(
                    "publishedAt",
                    event.target.value
                      ? new Date(event.target.value).toISOString()
                      : null,
                  )
                }
              />
            </div>
            <label className="admin-cms-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
              />
              Featured article
            </label>
            <div className="admin-cms-sidebar-actions">
              <button
                type="button"
                className="admin-cms-btn-outline"
                disabled={saving}
                onClick={() => void save("draft")}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="admin-cms-btn-gold"
                disabled={saving}
                onClick={() => void save("published")}
              >
                {isEdit ? "Update" : "Publish"}
              </button>
            </div>
          </section>

          <section className="admin-cms-sidebar-card">
            <h2 className="admin-cms-sidebar-title">Taxonomy</h2>
            <div className="admin-cms-field">
              <label htmlFor="article-category">Category</label>
              <input
                id="article-category"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="article-tags">Tags (comma-separated)</label>
              <input
                id="article-tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
              />
            </div>
          </section>

          <section className="admin-cms-sidebar-card">
            <h2 className="admin-cms-sidebar-title">Media</h2>
            <div className="admin-cms-field">
              <label htmlFor="article-image">Featured image URL</label>
              <input
                id="article-image"
                value={form.featuredImage ?? ""}
                onChange={(event) =>
                  updateField("featuredImage", event.target.value || null)
                }
                placeholder="https://…"
              />
            </div>
          </section>

          <section className="admin-cms-sidebar-card">
            <h2 className="admin-cms-sidebar-title">SEO</h2>
            <div className="admin-cms-field">
              <label htmlFor="article-seo-title">SEO title</label>
              <input
                id="article-seo-title"
                value={form.seoTitle}
                onChange={(event) => updateField("seoTitle", event.target.value)}
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="article-seo-desc">SEO description</label>
              <textarea
                id="article-seo-desc"
                rows={3}
                value={form.seoDescription}
                onChange={(event) => updateField("seoDescription", event.target.value)}
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="article-og">Open Graph image URL</label>
              <input
                id="article-og"
                value={form.ogImage ?? ""}
                onChange={(event) => updateField("ogImage", event.target.value || null)}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
