export const CMS_STATUSES = ["draft", "published", "archived"] as const;
export type CmsStatus = (typeof CMS_STATUSES)[number];

export const CMS_AUDIENCES = [
  "public",
  "client",
  "pilot",
  "admin",
  "moderator",
  "all",
] as const;
export type CmsAudience = (typeof CMS_AUDIENCES)[number];

export const CMS_RESOURCE_TYPES = [
  "pdf",
  "guide",
  "checklist",
  "template",
  "video",
  "external_link",
  "document",
] as const;
export type CmsResourceType = (typeof CMS_RESOURCE_TYPES)[number];

export type CmsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImage: string | null;
  category: string;
  tags: string[];
  audience: CmsAudience;
  status: CmsStatus;
  featured: boolean;
  author: string;
  readTimeMinutes: number;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  ogImage: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CmsResource = {
  id: string;
  title: string;
  slug: string;
  resourceType: CmsResourceType;
  summary: string;
  body: string;
  featuredImage: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  category: string;
  tags: string[];
  audience: CmsAudience;
  status: CmsStatus;
  featured: boolean;
  downloadCtaLabel: string;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CmsOverviewStats = {
  articleCount: number;
  resourceCount: number;
  publishedCount: number;
  draftCount: number;
};

export type CmsCollectionStats = {
  total: number;
  published: number;
  drafts: number;
};

export type CmsEngineOverviewDto = {
  stats: CmsOverviewStats;
  articles: CmsCollectionStats;
  resources: CmsCollectionStats;
  persistenceMode: "preview" | "persisted";
};

export type CmsArticleInput = Omit<
  CmsArticle,
  "id" | "createdAt" | "updatedAt"
>;

export type CmsResourceInput = Omit<
  CmsResource,
  "id" | "createdAt" | "updatedAt"
>;
