import Image from "next/image";
import Link from "next/link";
import { resourcesAssets } from "@/lib/marketing/resources-assets";

type ResourceArticleCardProps = {
  slug: string;
  categoryLabel: string;
  title: string;
  description: string;
};

/** Figma component — frame 323:6579 */
export function ResourceArticleCard({
  slug,
  categoryLabel,
  title,
  description,
}: ResourceArticleCardProps) {
  return (
    <Link
      href={`/resources/${slug}`}
      className="figma-resources-card group flex h-full flex-col overflow-hidden rounded-2xl border transition-colors"
    >
      <div className="figma-resources-card-icon flex min-h-[9.5rem] items-center justify-center rounded-b-[14px] sm:min-h-[10.5rem]">
        <Image
          src={resourcesAssets.bookCard}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
          aria-hidden
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
          {categoryLabel}
        </p>
        <h3 className="mt-3 text-[15px] font-bold leading-[1.35] tracking-tight text-ras-text">
          {title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-[1.6] text-ras-dim-alt">
          {description}
        </p>
        <span className="mt-5 text-sm font-semibold text-gold transition-colors group-hover:text-gold-light">
          Read More →
        </span>
      </div>
    </Link>
  );
}
