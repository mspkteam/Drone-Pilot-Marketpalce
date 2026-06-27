import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCmsArticleBySlug,
  getCmsResourceBySlug,
} from "@/lib/cms/cms-store";

type ResourceArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ResourceArticlePageProps) {
  const { slug } = await params;
  const article = await getCmsArticleBySlug(slug);
  const resource = article ? null : await getCmsResourceBySlug(slug);
  const item = article ?? resource;
  if (!item) {
    return { title: "Resource — Remote Air Service" };
  }
  return {
    title: `${item.title} — Remote Air Service`,
    description: "excerpt" in item ? item.excerpt : item.summary,
  };
}

export default async function ResourceArticlePage({
  params,
}: ResourceArticlePageProps) {
  const { slug } = await params;
  const article = await getCmsArticleBySlug(slug);
  const resource = article ? null : await getCmsResourceBySlug(slug);
  const item = article ?? resource;

  if (!item || item.status !== "published") {
    notFound();
  }

  const description = "excerpt" in item ? item.excerpt : item.summary;
  const body = item.body;

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
            {item.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ras-soft">
            {description}
          </p>
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-ras-muted">
            {body.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
