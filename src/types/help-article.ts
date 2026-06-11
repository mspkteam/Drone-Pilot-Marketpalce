export const HELP_ARTICLE_AUDIENCES = [
  "pilot",
  "client",
  "admin",
  "all",
] as const;

export type HelpArticleAudience = (typeof HELP_ARTICLE_AUDIENCES)[number];

export const HELP_ARTICLE_STATUSES = ["draft", "published"] as const;

export type HelpArticleStatus = (typeof HELP_ARTICLE_STATUSES)[number];

/** CMS-ready help article shape — swap seed module for DB/API later. */
export type HelpArticle = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  body: string;
  audience: HelpArticleAudience;
  status: HelpArticleStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
