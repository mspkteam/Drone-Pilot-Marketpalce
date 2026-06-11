import Link from "next/link";
import type { HelpArticle } from "@/types/help-article";

type PilotHelpArticleViewProps = {
  article: HelpArticle;
};

export function PilotHelpArticleView({ article }: PilotHelpArticleViewProps) {
  const paragraphs = article.body.split(/\n\n+/).filter(Boolean);

  return (
    <div className="pilot-support-page">
      <Link href="/dashboard/pilot/support" className="pilot-support-back">
        ← Back to Help Center
      </Link>

      <header className="pilot-support-header">
        <p className="pilot-support-eyebrow">{article.category.toUpperCase()}</p>
        <h1 className="pilot-support-title">{article.title}</h1>
        <p className="pilot-support-article-summary">{article.summary}</p>
      </header>

      <article className="pilot-support-article-body">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </article>
    </div>
  );
}
