"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type {
  CmsAudience,
  CmsResource,
  CmsResourceInput,
  CmsResourceType,
  CmsStatus,
} from "@/types/cms";
import { CMS_AUDIENCES, CMS_RESOURCE_TYPES, CMS_STATUSES } from "@/types/cms";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const emptyResource = (): CmsResourceInput => ({
  title: "",
  slug: "",
  resourceType: "guide",
  summary: "",
  body: "",
  featuredImage: null,
  fileUrl: null,
  externalUrl: null,
  category: "General",
  tags: [],
  audience: "public",
  status: "draft",
  featured: false,
  downloadCtaLabel: "Download",
  publishedAt: null,
  seoTitle: "",
  seoDescription: "",
  sortOrder: 100,
});

type AdminCmsResourceEditorProps = {
  resourceId?: string;
};

export function AdminCmsResourceEditor({ resourceId }: AdminCmsResourceEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(resourceId);
  const [form, setForm] = useState<CmsResourceInput>(emptyResource());
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cms/resources/${resourceId}`);
      const json = (await res.json()) as { resource?: CmsResource; error?: string };
      if (!res.ok || !json.resource) {
        setError(json.error ?? "Resource not found.");
        return;
      }
      const { id: _id, createdAt: _c, updatedAt: _u, ...input } = json.resource;
      setForm(input);
      setTagsInput(input.tags.join(", "));
    } catch {
      setError("Failed to load resource.");
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField<K extends keyof CmsResourceInput>(
    key: K,
    value: CmsResourceInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(status: CmsStatus) {
    setSaving(true);
    setError(null);
    setNotice(null);
    const payload: CmsResourceInput = {
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
      seoDescription: form.seoDescription || form.summary,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/cms/resources/${resourceId}` : "/api/admin/cms/resources",
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
      if (!isEdit && json.resource?.id) {
        router.push(`/dashboard/admin/cms/resources/${json.resource.id}/edit`);
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
    return <p className="admin-cms-loading">Loading resource…</p>;
  }

  return (
    <div className="admin-cms-page">
      <section className="admin-cms-editor-head">
        <div>
          <p className="admin-ops-eyebrow">CMS / RESOURCES</p>
          <h1 className="admin-cms-editor-title">
            {isEdit ? "Edit Resource" : "New Resource"}
          </h1>
        </div>
        <Link href="/dashboard/admin/cms/resources" className="admin-cms-btn-outline">
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
              <label htmlFor="resource-title">Title</label>
              <input
                id="resource-title"
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
            <div className="admin-cms-field-row">
              <div className="admin-cms-field">
                <label htmlFor="resource-slug">Slug</label>
                <input
                  id="resource-slug"
                  value={form.slug}
                  onChange={(event) => updateField("slug", slugify(event.target.value))}
                  required
                />
              </div>
              <div className="admin-cms-field">
                <label htmlFor="resource-type">Resource type</label>
                <select
                  id="resource-type"
                  value={form.resourceType}
                  onChange={(event) =>
                    updateField("resourceType", event.target.value as CmsResourceType)
                  }
                >
                  {CMS_RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-cms-field">
              <label htmlFor="resource-summary">Summary</label>
              <textarea
                id="resource-summary"
                rows={3}
                value={form.summary}
                onChange={(event) => updateField("summary", event.target.value)}
                required
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="resource-body">Body / description</label>
              <textarea
                id="resource-body"
                className="admin-cms-body-editor"
                rows={12}
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
              <label htmlFor="resource-status">Status</label>
              <select
                id="resource-status"
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
              <label htmlFor="resource-audience">Audience</label>
              <select
                id="resource-audience"
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
              <label htmlFor="resource-cta">Download CTA label</label>
              <input
                id="resource-cta"
                value={form.downloadCtaLabel}
                onChange={(event) => updateField("downloadCtaLabel", event.target.value)}
              />
            </div>
            <label className="admin-cms-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField("featured", event.target.checked)}
              />
              Featured resource
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
              <label htmlFor="resource-category">Category</label>
              <input
                id="resource-category"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value)}
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="resource-tags">Tags (comma-separated)</label>
              <input
                id="resource-tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
              />
            </div>
          </section>

          <section className="admin-cms-sidebar-card">
            <h2 className="admin-cms-sidebar-title">Media</h2>
            <div className="admin-cms-field">
              <label htmlFor="resource-image">Featured image URL</label>
              <input
                id="resource-image"
                value={form.featuredImage ?? ""}
                onChange={(event) =>
                  updateField("featuredImage", event.target.value || null)
                }
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="resource-file">File URL</label>
              <input
                id="resource-file"
                value={form.fileUrl ?? ""}
                onChange={(event) => updateField("fileUrl", event.target.value || null)}
                placeholder="Upload storage pending"
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="resource-external">External URL</label>
              <input
                id="resource-external"
                value={form.externalUrl ?? ""}
                onChange={(event) =>
                  updateField("externalUrl", event.target.value || null)
                }
              />
            </div>
          </section>

          <section className="admin-cms-sidebar-card">
            <h2 className="admin-cms-sidebar-title">SEO</h2>
            <div className="admin-cms-field">
              <label htmlFor="resource-seo-title">SEO title</label>
              <input
                id="resource-seo-title"
                value={form.seoTitle}
                onChange={(event) => updateField("seoTitle", event.target.value)}
              />
            </div>
            <div className="admin-cms-field">
              <label htmlFor="resource-seo-desc">SEO description</label>
              <textarea
                id="resource-seo-desc"
                rows={3}
                value={form.seoDescription}
                onChange={(event) => updateField("seoDescription", event.target.value)}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
