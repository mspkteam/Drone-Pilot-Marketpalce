import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HomePilotRank } from "@/lib/marketing/home-content";

type PilotRankCardProps = {
  rank: HomePilotRank;
  badgeSrc: string;
  className?: string;
};

function RankProgressDivider({
  divider,
  dashCount,
}: {
  divider: HomePilotRank["divider"];
  dashCount: number;
}) {
  if (divider === "line") {
    return <div className="figma-home-rank-divider-line" aria-hidden />;
  }

  return (
    <div className="figma-home-rank-dashes" aria-hidden>
      {Array.from({ length: dashCount }).map((_, index) => (
        <span key={index} className="figma-home-rank-dash" />
      ))}
    </div>
  );
}

export function PilotRankCard({ rank, badgeSrc, className }: PilotRankCardProps) {
  return (
    <article
      className={cn(
        "figma-home-rank-card",
        rank.elite && "figma-home-rank-card--elite",
        className,
      )}
    >
      {rank.elite ? (
        <span className="figma-home-rank-elite-badge">Elite</span>
      ) : null}

      <div className="figma-home-rank-card-content">
        <Image
          src={badgeSrc}
          alt={`${rank.code} ${rank.name} rank insignia`}
          width={27}
          height={46}
          className="figma-home-rank-badge"
        />
        <p className="figma-home-rank-code">{rank.code}</p>
        <p className="figma-home-rank-name">{rank.displayTitle}</p>
        <RankProgressDivider divider={rank.divider} dashCount={rank.dashCount} />
        <p className="figma-home-rank-subtitle">{rank.subtitle}</p>
      </div>
    </article>
  );
}
