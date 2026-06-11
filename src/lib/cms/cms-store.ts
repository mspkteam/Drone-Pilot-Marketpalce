import { buildArticlesSeed, buildResourcesSeed } from "@/lib/cms/cms-seed";
import type {
  CmsArticle,
  CmsArticleInput,
  CmsCollectionStats,
  CmsEngineOverviewDto,
  CmsResource,
  CmsResourceInput,
  CmsStatus,
} from "@/types/cms";

/** In-memory preview store — resets on server restart until Prisma CMS models ship. */
let articlesStore: CmsArticle[] | null = null;
let resourcesStore: CmsResource[] | null = null;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function initArticles(): CmsArticle[] {
  if (!articlesStore) {
    articlesStore = buildArticlesSeed();
  }
  return articlesStore;
}

function initResources(): CmsResource[] {
  if (!resourcesStore) {
    resourcesStore = buildResourcesSeed();
  }
  return resourcesStore;
}

function collectionStats<T extends { status: CmsStatus }>(
  items: T[],
): CmsCollectionStats {
  return {
    total: items.length,
    published: items.filter((item) => item.status === "published").length,
    drafts: items.filter((item) => item.status === "draft").length,
  };
}

export function getCmsOverview(): CmsEngineOverviewDto {
  const articles = initArticles();
  const resources = initResources();
  const all = [...articles, ...resources];
  return {
    stats: {
      articleCount: articles.length,
      resourceCount: resources.length,
      publishedCount: all.filter((item) => item.status === "published").length,
      draftCount: all.filter((item) => item.status === "draft").length,
    },
    articles: collectionStats(articles),
    resources: collectionStats(resources),
    persistenceMode: "preview",
  };
}

export function listCmsArticles(): CmsArticle[] {
  return [...initArticles()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCmsArticleById(id: string): CmsArticle | null {
  return initArticles().find((article) => article.id === id) ?? null;
}

export function getCmsArticleBySlug(slug: string): CmsArticle | null {
  return initArticles().find((article) => article.slug === slug) ?? null;
}

export function createCmsArticle(
  input: CmsArticleInput,
): { ok: true; article: CmsArticle } | { ok: false; error: string } {
  const articles = initArticles();
  const slug = slugify(input.slug || input.title);
  if (!slug) return { ok: false, error: "Slug is required." };
  if (articles.some((article) => article.slug === slug)) {
    return { ok: false, error: "Slug already exists." };
  }

  const now = new Date().toISOString();
  const article: CmsArticle = {
    ...input,
    id: `cms-article-${crypto.randomUUID()}`,
    slug,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  articles.unshift(article);
  return { ok: true, article: clone(article) };
}

export function updateCmsArticle(
  id: string,
  input: Partial<CmsArticleInput>,
): { ok: true; article: CmsArticle } | { ok: false; error: string; status?: 404 } {
  const articles = initArticles();
  const index = articles.findIndex((article) => article.id === id);
  if (index < 0) {
    return { ok: false, error: "Article not found.", status: 404 };
  }

  const existing = articles[index];
  const nextSlug = input.slug ? slugify(input.slug) : existing.slug;
  if (
    nextSlug !== existing.slug &&
    articles.some((article) => article.slug === nextSlug)
  ) {
    return { ok: false, error: "Slug already exists." };
  }

  const updated: CmsArticle = {
    ...existing,
    ...input,
    slug: nextSlug,
    tags: input.tags ?? existing.tags,
    updatedAt: new Date().toISOString(),
  };
  articles[index] = updated;
  return { ok: true, article: clone(updated) };
}

export function listCmsResources(): CmsResource[] {
  return [...initResources()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCmsResourceById(id: string): CmsResource | null {
  return initResources().find((resource) => resource.id === id) ?? null;
}

export function createCmsResource(
  input: CmsResourceInput,
): { ok: true; resource: CmsResource } | { ok: false; error: string } {
  const resources = initResources();
  const slug = slugify(input.slug || input.title);
  if (!slug) return { ok: false, error: "Slug is required." };
  if (resources.some((resource) => resource.slug === slug)) {
    return { ok: false, error: "Slug already exists." };
  }

  const now = new Date().toISOString();
  const resource: CmsResource = {
    ...input,
    id: `cms-resource-${crypto.randomUUID()}`,
    slug,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  resources.unshift(resource);
  return { ok: true, resource: clone(resource) };
}

export function updateCmsResource(
  id: string,
  input: Partial<CmsResourceInput>,
): { ok: true; resource: CmsResource } | { ok: false; error: string; status?: 404 } {
  const resources = initResources();
  const index = resources.findIndex((resource) => resource.id === id);
  if (index < 0) {
    return { ok: false, error: "Resource not found.", status: 404 };
  }

  const existing = resources[index];
  const nextSlug = input.slug ? slugify(input.slug) : existing.slug;
  if (
    nextSlug !== existing.slug &&
    resources.some((resource) => resource.slug === nextSlug)
  ) {
    return { ok: false, error: "Slug already exists." };
  }

  const updated: CmsResource = {
    ...existing,
    ...input,
    slug: nextSlug,
    tags: input.tags ?? existing.tags,
    updatedAt: new Date().toISOString(),
  };
  resources[index] = updated;
  return { ok: true, resource: clone(updated) };
}
