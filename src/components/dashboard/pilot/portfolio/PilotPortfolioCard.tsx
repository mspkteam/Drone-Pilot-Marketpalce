import type { PilotPortfolioItem } from "@/lib/pilot/portfolio";

type PilotPortfolioCardProps = {
  item: PilotPortfolioItem;
};

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="13" stroke="var(--color-gold)" strokeWidth="1.5" />
      <path d="M11.5 9.5v9l7.5-4.5-7.5-4.5z" fill="var(--color-gold)" />
    </svg>
  );
}

export function PilotPortfolioCard({ item }: PilotPortfolioCardProps) {
  return (
    <article className="pilot-portfolio-card">
      <div className="pilot-portfolio-preview">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnailUrl} alt="" className="pilot-portfolio-preview-img" />
        ) : item.type === "VIDEO" ? (
          <span className="pilot-portfolio-play">
            <PlayIcon />
          </span>
        ) : null}
      </div>

      <p className="pilot-portfolio-type">{item.type}</p>
      <h3 className="pilot-portfolio-title">{item.title}</h3>

      <div className="pilot-portfolio-tags">
        {item.tags.map((tag) => (
          <span key={tag} className="pilot-portfolio-tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
