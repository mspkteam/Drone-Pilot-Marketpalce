import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HomePilotRank } from "@/lib/marketing/home-content";

type PilotRankCardProps = {
  rank: HomePilotRank;
  badgeSrc: string;
  className?: string;
};

function RankProgressDivider({
  progressLabel,
  progressPercent,
}: {
  progressLabel: string;
  progressPercent: number;
}) {
  return (
    <div className="figma-home-rank-progress">
      <span className="figma-home-rank-progress-label">{progressLabel}</span>
      <div className="figma-home-rank-progress-track" aria-hidden>
        <span
          className="figma-home-rank-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
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
        <RankProgressDivider
          progressLabel={rank.progressLabel}
          progressPercent={rank.progressPercent}
        />
        <p className="figma-home-rank-subtitle">{rank.subtitle}</p>
      </div>
    </article>
  );
}
