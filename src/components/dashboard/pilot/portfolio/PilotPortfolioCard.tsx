import type { PilotPortfolioItem } from "@/lib/pilot/portfolio";

type PilotPortfolioCardProps = {
  item: PilotPortfolioItem;
  busy?: boolean;
  onEdit: (item: PilotPortfolioItem) => void;
  onRemove: (item: PilotPortfolioItem) => void;
};

export function PilotPortfolioCard({
  item,
  busy = false,
  onEdit,
  onRemove,
}: PilotPortfolioCardProps) {
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
      {item.description ? (
        <p className="pilot-portfolio-description">{item.description}</p>
      ) : null}

      <div className="pilot-portfolio-tags">
        {item.tags.map((tag) => (
          <span key={tag} className="pilot-portfolio-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="pilot-portfolio-card-actions">
        <button
          type="button"
          className="pilot-portfolio-btn-outline"
          onClick={() => onEdit(item)}
          disabled={busy}
        >
          Edit
        </button>
        <button
          type="button"
          className="pilot-portfolio-btn-danger"
          onClick={() => onRemove(item)}
          disabled={busy}
        >
          Remove
        </button>
      </div>
    </article>
  );
}
