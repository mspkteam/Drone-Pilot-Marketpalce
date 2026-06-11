import { getHelpArticlesSeed } from "@/lib/help/help-articles";
import {
  FEATURED_RESOURCE,
  RESOURCE_ARTICLES,
  RESOURCE_CATEGORIES,
} from "@/lib/marketing/resources-content";
import { homeAssets } from "@/lib/marketing/home-assets";
import type { CmsArticle, CmsResource } from "@/types/cms";
import type { HelpArticle } from "@/types/help-article";

function estimateReadTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function mapHelpAudience(
  audience: HelpArticle["audience"],
): CmsArticle["audience"] {
  if (audience === "admin") return "admin";
  if (audience === "client") return "client";
  if (audience === "pilot") return "pilot";
  return "all";
}

function helpToCmsArticle(article: HelpArticle): CmsArticle {
  const now = article.updatedAt;
  return {
    id: `cms-article-${article.id}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.summary,
    body: article.body,
    featuredImage: null,
    category: article.category,
    tags: [article.category.toLowerCase(), "support"],
    audience: mapHelpAudience(article.audience),
    status: article.status === "published" ? "published" : "draft",
    featured: article.sortOrder <= 20,
    author: "Remote Air Service",
    readTimeMinutes: estimateReadTime(article.body),
    publishedAt: article.status === "published" ? article.createdAt : null,
    seoTitle: article.title,
    seoDescription: article.summary,
    ogImage: null,
    sortOrder: article.sortOrder,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

function categoryLabel(categoryId: string): string {
  return (
    RESOURCE_CATEGORIES.find((cat) => cat.id === categoryId)?.label ?? categoryId
  );
}

function marketingArticleToCms(
  article: (typeof RESOURCE_ARTICLES)[number],
  index: number,
): CmsArticle {
  const createdAt = "2026-01-10T00:00:00.000Z";
  return {
    id: `cms-article-mkt-${article.slug}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.description,
    body: `${article.description}\n\nFull article body pending CMS integration on the public Resources page.`,
    featuredImage: homeAssets.ranks.a3,
    category: categoryLabel(article.categoryId),
    tags: [article.categoryId, "resources"],
    audience: "public",
    status: "published",
    featured: false,
    author: "Remote Air Service",
    readTimeMinutes: estimateReadTime(article.description),
    publishedAt: createdAt,
    seoTitle: article.title,
    seoDescription: article.description,
    ogImage: homeAssets.ranks.a3,
    sortOrder: 100 + index,
    createdAt,
    updatedAt: "2026-05-01T00:00:00.000Z",
  };
}

const featuredMarketingArticle: CmsArticle = {
  id: "cms-article-mkt-featured",
  title: FEATURED_RESOURCE.title,
  slug: FEATURED_RESOURCE.slug,
  excerpt: FEATURED_RESOURCE.description,
  body: `${FEATURED_RESOURCE.description}\n\nFeatured knowledge center article.`,
  featuredImage: homeAssets.ranks.a4,
  category: categoryLabel(FEATURED_RESOURCE.categoryId),
  tags: [FEATURED_RESOURCE.categoryId, "featured"],
  audience: "public",
  status: "published",
  featured: true,
  author: "Remote Air Service",
  readTimeMinutes: 4,
  publishedAt: "2026-01-05T00:00:00.000Z",
  seoTitle: FEATURED_RESOURCE.title,
  seoDescription: FEATURED_RESOURCE.description,
  ogImage: homeAssets.ranks.a4,
  sortOrder: 5,
  createdAt: "2026-01-05T00:00:00.000Z",
  updatedAt: "2026-05-15T00:00:00.000Z",
};

export function buildArticlesSeed(): CmsArticle[] {
  const helpArticles = getHelpArticlesSeed().map(helpToCmsArticle);
  const marketingArticles = RESOURCE_ARTICLES.map(marketingArticleToCms);
  return [featuredMarketingArticle, ...helpArticles, ...marketingArticles];
}

export function buildResourcesSeed(): CmsResource[] {
  const base = "2026-02-01T00:00:00.000Z";
  return [
    {
      id: "cms-resource-part107-checklist",
      title: "FAA Part 107 Pre-Flight Checklist",
      slug: "faa-part-107-preflight-checklist",
      resourceType: "checklist",
      summary: "Printable checklist for commercial pilots before every mission.",
      body: "Airspace, weather, NOTAMs, crew briefing, and client deliverable confirmation.",
      featuredImage: "/marketing/icon-trust-verified.png",
      fileUrl: null,
      externalUrl: null,
      category: "Safety",
      tags: ["part-107", "checklist", "safety"],
      audience: "pilot",
      status: "published",
      featured: true,
      downloadCtaLabel: "Download Checklist",
      publishedAt: base,
      seoTitle: "FAA Part 107 Pre-Flight Checklist",
      seoDescription: "Printable pre-flight checklist for commercial drone pilots.",
      sortOrder: 10,
      createdAt: base,
      updatedAt: "2026-05-10T00:00:00.000Z",
    },
    {
      id: "cms-resource-client-hiring-guide",
      title: "Client Hiring Guide (PDF)",
      slug: "client-hiring-guide-pdf",
      resourceType: "pdf",
      summary: "What to verify before hiring a drone pilot on the marketplace.",
      body: "Credentials, insurance, scope, deliverables, and communication templates.",
      featuredImage: homeAssets.ranks.a2,
      fileUrl: null,
      externalUrl: null,
      category: "Client Hiring Guides",
      tags: ["client", "hiring", "pdf"],
      audience: "client",
      status: "published",
      featured: false,
      downloadCtaLabel: "Download PDF",
      publishedAt: base,
      seoTitle: "Client Hiring Guide",
      seoDescription: "PDF guide for clients hiring drone pilots.",
      sortOrder: 20,
      createdAt: base,
      updatedAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: "cms-resource-safety-policy",
      title: "Platform Safety Policy",
      slug: "platform-safety-policy",
      resourceType: "document",
      summary: "Operational safety expectations for pilots and clients.",
      body: "Airspace compliance, insurance, incident reporting, and escalation paths.",
      featuredImage: homeAssets.ranks.a3,
      fileUrl: null,
      externalUrl: null,
      category: "Safety",
      tags: ["policy", "safety"],
      audience: "all",
      status: "published",
      featured: false,
      downloadCtaLabel: "View Document",
      publishedAt: base,
      seoTitle: "Platform Safety Policy",
      seoDescription: "Remote Air Service safety policy for marketplace operations.",
      sortOrder: 30,
      createdAt: base,
      updatedAt: "2026-05-20T00:00:00.000Z",
    },
    {
      id: "cms-resource-mission-template",
      title: "Mission Scope Template",
      slug: "mission-scope-template",
      resourceType: "template",
      summary: "Template for clients to define aerial mission scope and deliverables.",
      body: "Location, timing, shot list, restrictions, and approval workflow.",
      featuredImage: homeAssets.ranks.a1,
      fileUrl: null,
      externalUrl: null,
      category: "Client Hiring Guides",
      tags: ["template", "missions"],
      audience: "client",
      status: "draft",
      featured: false,
      downloadCtaLabel: "Download Template",
      publishedAt: null,
      seoTitle: "Mission Scope Template",
      seoDescription: "Client mission scope template for drone projects.",
      sortOrder: 40,
      createdAt: base,
      updatedAt: "2026-05-22T00:00:00.000Z",
    },
    {
      id: "cms-resource-faa-link",
      title: "FAA UAS Remote ID Reference",
      slug: "faa-uas-remote-id-reference",
      resourceType: "external_link",
      summary: "Official FAA reference for remote identification requirements.",
      body: "External regulatory reference for pilots operating under Part 107.",
      featuredImage: null,
      fileUrl: null,
      externalUrl: "https://www.faa.gov/uas/getting_started/remote_id",
      category: "Drone Laws",
      tags: ["faa", "regulations"],
      audience: "pilot",
      status: "published",
      featured: false,
      downloadCtaLabel: "Open Link",
      publishedAt: base,
      seoTitle: "FAA UAS Remote ID Reference",
      seoDescription: "External FAA remote ID reference for drone pilots.",
      sortOrder: 50,
      createdAt: base,
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
  ];
}
