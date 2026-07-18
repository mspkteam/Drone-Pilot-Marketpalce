import { buildArticlesSeed, buildResourcesSeed } from "@/lib/cms/cms-seed";
import { prisma } from "@/lib/db";
import type {
  CmsArticle,
  CmsArticleInput,
  CmsCollectionStats,
  CmsEngineOverviewDto,
  CmsResource,
  CmsResourceInput,
  CmsStatus,
} from "@/types/cms";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function parseTags(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function mapArticle(record: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImage: string | null;
  category: string;
  tagsJson: string;
  audience: string;
  status: string;
  featured: boolean;
  author: string;
  readTimeMinutes: number;
  publishedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
  ogImage: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): CmsArticle {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    body: record.body,
    featuredImage: record.featuredImage,
    category: record.category,
    tags: parseTags(record.tagsJson),
    audience: record.audience as CmsArticle["audience"],
    status: record.status as CmsStatus,
    featured: record.featured,
    author: record.author,
    readTimeMinutes: record.readTimeMinutes,
    publishedAt: record.publishedAt?.toISOString() ?? null,
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    ogImage: record.ogImage,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapResource(record: {
  id: string;
  title: string;
  slug: string;
  resourceType: string;
  summary: string;
  body: string;
  featuredImage: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  category: string;
  tagsJson: string;
  audience: string;
  status: string;
  featured: boolean;
  downloadCtaLabel: string;
  publishedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): CmsResource {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    resourceType: record.resourceType as CmsResource["resourceType"],
    summary: record.summary,
    body: record.body,
    featuredImage: record.featuredImage,
    fileUrl: record.fileUrl,
    externalUrl: record.externalUrl,
    category: record.category,
    tags: parseTags(record.tagsJson),
    audience: record.audience as CmsResource["audience"],
    status: record.status as CmsStatus,
    featured: record.featured,
    downloadCtaLabel: record.downloadCtaLabel,
    publishedAt: record.publishedAt?.toISOString() ?? null,
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function seedCmsArticles(articles: ReturnType<typeof buildArticlesSeed>): Promise<void> {
  if (articles.length === 0) return;

  await prisma.cmsArticleRecord.createMany({
    data: articles.map((article) => ({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      body: article.body,
      featuredImage: article.featuredImage,
      category: article.category,
      tagsJson: JSON.stringify(article.tags),
      audience: article.audience,
      status: article.status,
      featured: article.featured,
      author: article.author,
      readTimeMinutes: article.readTimeMinutes,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      ogImage: article.ogImage,
      sortOrder: article.sortOrder,
      createdAt: new Date(article.createdAt),
      updatedAt: new Date(article.updatedAt),
    })),
    skipDuplicates: true,
  });
}

async function seedCmsResources(
  resources: ReturnType<typeof buildResourcesSeed>,
): Promise<void> {
  if (resources.length === 0) return;

  await prisma.cmsResourceRecord.createMany({
    data: resources.map((resource) => ({
      title: resource.title,
      slug: resource.slug,
      resourceType: resource.resourceType,
      summary: resource.summary,
      body: resource.body,
      featuredImage: resource.featuredImage,
      fileUrl: resource.fileUrl,
      externalUrl: resource.externalUrl,
      category: resource.category,
      tagsJson: JSON.stringify(resource.tags),
      audience: resource.audience,
      status: resource.status,
      featured: resource.featured,
      downloadCtaLabel: resource.downloadCtaLabel,
      publishedAt: resource.publishedAt ? new Date(resource.publishedAt) : null,
      seoTitle: resource.seoTitle,
      seoDescription: resource.seoDescription,
      sortOrder: resource.sortOrder,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt),
    })),
    skipDuplicates: true,
  });
}

/** Idempotent CMS bootstrap — safe during parallel static generation. */
export async function seedCmsContent(): Promise<void> {
  await seedCmsArticles(buildArticlesSeed());
  await seedCmsResources(buildResourcesSeed());
}

let cmsSeedPromise: Promise<void> | null = null;

async function ensureCmsSeeded(): Promise<void> {
  if (!cmsSeedPromise) {
    cmsSeedPromise = seedCmsContent().catch((error) => {
      cmsSeedPromise = null;
      throw error;
    });
  }
  await cmsSeedPromise;
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

export async function getCmsOverview(): Promise<CmsEngineOverviewDto> {
  await ensureCmsSeeded();
  const [articles, resources] = await Promise.all([
    listCmsArticles(),
    listCmsResources(),
  ]);
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
    persistenceMode: "persisted",
  };
}

export async function listCmsArticles(): Promise<CmsArticle[]> {
  await ensureCmsSeeded();
  const records = await prisma.cmsArticleRecord.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return records.map(mapArticle);
}

export async function listPublishedCmsArticles(): Promise<CmsArticle[]> {
  await ensureCmsSeeded();
  const records = await prisma.cmsArticleRecord.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
  });
  return records.map(mapArticle);
}

export async function getCmsArticleById(id: string): Promise<CmsArticle | null> {
  await ensureCmsSeeded();
  const record = await prisma.cmsArticleRecord.findUnique({ where: { id } });
  return record ? mapArticle(record) : null;
}

export async function getCmsArticleBySlug(
  slug: string,
): Promise<CmsArticle | null> {
  await ensureCmsSeeded();
  const record = await prisma.cmsArticleRecord.findUnique({ where: { slug } });
  return record ? mapArticle(record) : null;
}

export async function createCmsArticle(
  input: CmsArticleInput,
): Promise<{ ok: true; article: CmsArticle } | { ok: false; error: string }> {
  await ensureCmsSeeded();
  const slug = slugify(input.slug || input.title);
  if (!slug) return { ok: false, error: "Slug is required." };

  const existing = await prisma.cmsArticleRecord.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: "Slug already exists." };

  const record = await prisma.cmsArticleRecord.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      body: input.body,
      featuredImage: input.featuredImage,
      category: input.category,
      tagsJson: JSON.stringify(input.tags ?? []),
      audience: input.audience,
      status: input.status,
      featured: input.featured,
      author: input.author,
      readTimeMinutes: input.readTimeMinutes,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      ogImage: input.ogImage,
      sortOrder: input.sortOrder,
    },
  });

  return { ok: true, article: mapArticle(record) };
}

export async function updateCmsArticle(
  id: string,
  input: Partial<CmsArticleInput>,
): Promise<
  { ok: true; article: CmsArticle } | { ok: false; error: string; status?: 404 }
> {
  const existing = await prisma.cmsArticleRecord.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Article not found.", status: 404 };
  }

  const nextSlug = input.slug ? slugify(input.slug) : existing.slug;
  if (nextSlug !== existing.slug) {
    const conflict = await prisma.cmsArticleRecord.findUnique({
      where: { slug: nextSlug },
    });
    if (conflict) return { ok: false, error: "Slug already exists." };
  }

  const record = await prisma.cmsArticleRecord.update({
    where: { id },
    data: {
      title: input.title,
      slug: nextSlug,
      excerpt: input.excerpt,
      body: input.body,
      featuredImage: input.featuredImage,
      category: input.category,
      tagsJson: input.tags ? JSON.stringify(input.tags) : undefined,
      audience: input.audience,
      status: input.status,
      featured: input.featured,
      author: input.author,
      readTimeMinutes: input.readTimeMinutes,
      publishedAt:
        input.publishedAt === undefined
          ? undefined
          : input.publishedAt
            ? new Date(input.publishedAt)
            : null,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      ogImage: input.ogImage,
      sortOrder: input.sortOrder,
    },
  });

  return { ok: true, article: mapArticle(record) };
}

export async function deleteCmsArticle(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string; status?: 404 }> {
  const existing = await prisma.cmsArticleRecord.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Article not found.", status: 404 };
  }
  await prisma.cmsArticleRecord.delete({ where: { id } });
  return { ok: true };
}

export async function listCmsResources(): Promise<CmsResource[]> {
  await ensureCmsSeeded();
  const records = await prisma.cmsResourceRecord.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return records.map(mapResource);
}

export async function listPublishedCmsResources(): Promise<CmsResource[]> {
  await ensureCmsSeeded();
  const records = await prisma.cmsResourceRecord.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { publishedAt: "desc" }],
  });
  return records.map(mapResource);
}

export async function getCmsResourceById(id: string): Promise<CmsResource | null> {
  await ensureCmsSeeded();
  const record = await prisma.cmsResourceRecord.findUnique({ where: { id } });
  return record ? mapResource(record) : null;
}

export async function getCmsResourceBySlug(
  slug: string,
): Promise<CmsResource | null> {
  await ensureCmsSeeded();
  const record = await prisma.cmsResourceRecord.findUnique({ where: { slug } });
  return record ? mapResource(record) : null;
}

export async function createCmsResource(
  input: CmsResourceInput,
): Promise<{ ok: true; resource: CmsResource } | { ok: false; error: string }> {
  await ensureCmsSeeded();
  const slug = slugify(input.slug || input.title);
  if (!slug) return { ok: false, error: "Slug is required." };

  const existing = await prisma.cmsResourceRecord.findUnique({ where: { slug } });
  if (existing) return { ok: false, error: "Slug already exists." };

  const record = await prisma.cmsResourceRecord.create({
    data: {
      title: input.title,
      slug,
      resourceType: input.resourceType,
      summary: input.summary,
      body: input.body,
      featuredImage: input.featuredImage,
      fileUrl: input.fileUrl,
      externalUrl: input.externalUrl,
      category: input.category,
      tagsJson: JSON.stringify(input.tags ?? []),
      audience: input.audience,
      status: input.status,
      featured: input.featured,
      downloadCtaLabel: input.downloadCtaLabel,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      sortOrder: input.sortOrder,
    },
  });

  return { ok: true, resource: mapResource(record) };
}

export async function updateCmsResource(
  id: string,
  input: Partial<CmsResourceInput>,
): Promise<
  { ok: true; resource: CmsResource } | { ok: false; error: string; status?: 404 }
> {
  const existing = await prisma.cmsResourceRecord.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Resource not found.", status: 404 };
  }

  const nextSlug = input.slug ? slugify(input.slug) : existing.slug;
  if (nextSlug !== existing.slug) {
    const conflict = await prisma.cmsResourceRecord.findUnique({
      where: { slug: nextSlug },
    });
    if (conflict) return { ok: false, error: "Slug already exists." };
  }

  const record = await prisma.cmsResourceRecord.update({
    where: { id },
    data: {
      title: input.title,
      slug: nextSlug,
      resourceType: input.resourceType,
      summary: input.summary,
      body: input.body,
      featuredImage: input.featuredImage,
      fileUrl: input.fileUrl,
      externalUrl: input.externalUrl,
      category: input.category,
      tagsJson: input.tags ? JSON.stringify(input.tags) : undefined,
      audience: input.audience,
      status: input.status,
      featured: input.featured,
      downloadCtaLabel: input.downloadCtaLabel,
      publishedAt:
        input.publishedAt === undefined
          ? undefined
          : input.publishedAt
            ? new Date(input.publishedAt)
            : null,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      sortOrder: input.sortOrder,
    },
  });

  return { ok: true, resource: mapResource(record) };
}

export async function deleteCmsResource(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string; status?: 404 }> {
  const existing = await prisma.cmsResourceRecord.findUnique({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Resource not found.", status: 404 };
  }
  await prisma.cmsResourceRecord.delete({ where: { id } });
  return { ok: true };
}
