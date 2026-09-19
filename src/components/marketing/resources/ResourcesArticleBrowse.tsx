"use client";

import { useMemo, useState } from "react";
import { ResourceArticleCard } from "@/components/marketing/resources/ResourceArticleCard";
import { ResourcesFeaturedCard } from "@/components/marketing/resources/ResourcesFeaturedCard";
import {
  RESOURCE_CATEGORIES,
  type ResourceCategoryId,
} from "@/lib/marketing/resources-content";
import { cn } from "@/lib/utils";
import type { CmsArticle, CmsResource } from "@/types/cms";

type BrowseArticle = {
  slug: string;
  categoryLabel: string;
  title: string;
  description: string;
  categoryId?: ResourceCategoryId;
};

type ResourcesArticleBrowseProps = {
  cmsArticles?: CmsArticle[];
  cmsResources?: CmsResource[];
};

function normalizeCategoryId(raw: string | null | undefined): ResourceCategoryId | undefined {
  if (!raw) return undefined;
  const hay = raw.trim().toLowerCase().replace(/[_\s]+/g, "-");
  const match = RESOURCE_CATEGORIES.find(
    (c) =>
      c.id === hay ||
      c.label.toLowerCase().replace(/[_\s]+/g, "-") === hay ||
      hay.includes(c.id) ||
      c.id.includes(hay),
  );
  return match?.id;
}

function mapCmsArticles(articles: CmsArticle[]): BrowseArticle[] {
  return articles.map((article) => ({
    slug: article.slug,
    categoryLabel: article.category,
    title: article.title,
    description: article.excerpt,
    categoryId: normalizeCategoryId(article.category),
  }));
}

function mapCmsResources(resources: CmsResource[]): BrowseArticle[] {
  return resources.map((resource) => ({
    slug: resource.slug,
    categoryLabel: resource.category,
    title: resource.title,
    description: resource.summary,
    categoryId: normalizeCategoryId(resource.category),
  }));
}

export function ResourcesArticleBrowse({
  cmsArticles = [],
  cmsResources = [],
}: ResourcesArticleBrowseProps) {
  const [activeCategory, setActiveCategory] = useState<ResourceCategoryId | null>(
    null,
  );

  const articles = useMemo<BrowseArticle[]>(() => {
    return [...mapCmsArticles(cmsArticles), ...mapCmsResources(cmsResources)];
  }, [cmsArticles, cmsResources]);

  const featured = articles[0] ?? null;

  const filteredArticles = activeCategory
    ? articles.filter((article) => article.categoryId === activeCategory)
    : articles;

  function handleCategoryClick(categoryId: ResourceCategoryId) {
    setActiveCategory((current) =>
      current === categoryId ? null : categoryId,
    );
  }

  return (
    <section
      className="figma-resources-section pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20"
      aria-label="Resources content"
    >
      <div className="public-container space-y-8 sm:space-y-10">
        {featured ? (
          <ResourcesFeaturedCard
            slug={featured.slug}
            title={featured.title}
            description={featured.description}
            categoryLabel={featured.categoryLabel}
          />
        ) : null}

        <div className="flex gap-2.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {RESOURCE_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "figma-resources-pill shrink-0 rounded-full border px-5 py-2.5 text-[13px] font-semibold transition-colors",
                  isActive && "figma-resources-pill--active",
                )}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <li key={article.slug}>
              <ResourceArticleCard
                slug={article.slug}
                categoryLabel={article.categoryLabel}
                title={article.title}
                description={article.description}
              />
            </li>
          ))}
        </ul>

        {filteredArticles.length === 0 ? (
          <p className="text-sm text-ras-dim-alt">
            No published CMS articles or resources yet. Add content in Admin → CMS.
          </p>
        ) : null}
      </div>
    </section>
  );
}
