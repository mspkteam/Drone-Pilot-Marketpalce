import Image from "next/image";
import Link from "next/link";
import { FEATURED_RESOURCE } from "@/lib/marketing/resources-content";
import { resourcesAssets } from "@/lib/marketing/resources-assets";

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Figma component — frame 323:6564 */
export function ResourcesFeaturedCard() {
  return (
    <Link
      href={`/resources/${FEATURED_RESOURCE.slug}`}
      className="figma-resources-featured group flex flex-col overflow-hidden rounded-[20px] border transition-colors lg:min-h-[13.75rem] lg:flex-row lg:items-center lg:justify-between lg:gap-16"
    >
      <div className="order-2 flex flex-1 flex-col justify-center px-8 py-8 sm:px-10 sm:py-10 lg:order-1 lg:py-10 lg:pl-10 lg:pr-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {FEATURED_RESOURCE.label}
        </p>
        <h2 className="mt-4 max-w-[34rem] text-[1.625rem] font-extrabold leading-[1.2] tracking-tight text-ras-text sm:text-[1.75rem] lg:text-[2rem]">
          {FEATURED_RESOURCE.title}
        </h2>
        <p className="mt-4 max-w-[32rem] text-sm leading-[1.65] text-ras-warm sm:text-[15px]">
          {FEATURED_RESOURCE.description}
        </p>
        <span className="mt-7 inline-flex h-10 w-fit items-center justify-center gap-2 rounded-[10px] bg-gold px-6 text-sm font-bold text-ras-cta transition-colors group-hover:bg-gold-light">
          Read Guide
          <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
      <div className="order-1 flex shrink-0 items-center justify-center px-8 py-6 sm:py-8 lg:order-2 lg:px-10 lg:py-10">
        <Image
          src={resourcesAssets.bookFeatured}
          alt=""
          width={120}
          height={120}
          className="h-[7.5rem] w-[7.5rem] object-contain lg:h-[7.75rem] lg:w-[7.75rem]"
          aria-hidden
        />
      </div>
    </Link>
  );
}
