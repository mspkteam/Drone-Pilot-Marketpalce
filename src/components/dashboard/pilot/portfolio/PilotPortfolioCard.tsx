import type { PilotPortfolioItem } from "@/lib/pilot/portfolio";

type PilotPortfolioCardProps = {
  item: PilotPortfolioItem;
};

export function PilotPortfolioCard({ item }: PilotPortfolioCardProps) {
  return (
    <article className="pilot-portfolio-card pilot-portfolio-bracket-card">
      <div className="pilot-portfolio-preview">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnailUrl} alt="" className="pilot-portfolio-preview-img" />
        ) : null}
        {item.type === "VIDEO" ? (
          <span className="pilot-portfolio-play">
            <img
              src="/icons/pilot-dashboard/portfolio-play.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden
            />
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
