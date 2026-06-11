import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FEATURED_RESOURCE,
  RESOURCE_ARTICLES,
} from "@/lib/marketing/resources-content";

type ResourceArticlePageProps = {
  params: Promise<{ slug: string }>;
};

function getArticle(slug: string) {
  if (FEATURED_RESOURCE.slug === slug) {
    return FEATURED_RESOURCE;
  }
  return RESOURCE_ARTICLES.find((article) => article.slug === slug);
}

export async function generateStaticParams() {
  return [
    { slug: FEATURED_RESOURCE.slug },
    ...RESOURCE_ARTICLES.map((article) => ({ slug: article.slug })),
  ];
}

export async function generateMetadata({ params }: ResourceArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return { title: "Resource — Remote Air Service" };
  }
  return {
    title: `${article.title} — Remote Air Service`,
    description: article.description,
  };
}

export default async function ResourceArticlePage({
  params,
}: ResourceArticlePageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    notFound();
  }

  return (
    <section className="figma-resources-section figma-marketing-section">
      <div className="public-container">
        <div className="max-w-3xl">
          <Link
            href="/resources"
            className="text-sm font-semibold text-gold hover:text-gold-light"
          >
            ← Back to Resources
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ras-text sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ras-soft">
            {article.description}
          </p>
          <p className="mt-8 rounded-[14px] border border-[rgba(216,179,57,0.22)] bg-surface px-5 py-4 text-sm text-ras-muted">
            Full article content is pending CMS integration (M30-Resources CMS).
            This placeholder route confirms navigation from resource cards.
          </p>
        </div>
      </div>
    </section>
  );
}
