import Link from "next/link";
import { cn } from "@/lib/utils";

type MarketingPathCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
};

export function MarketingPathCard({
  href,
  eyebrow,
  title,
  description,
  className,
}: MarketingPathCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "premium-card group block p-6 transition-[border-color,box-shadow] duration-200 hover:border-gold/40 hover:shadow-[var(--glow-gold)]",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-gold">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-foreground group-hover:text-gold-light">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <p className="mt-4 text-sm font-medium text-gold-light">Learn more →</p>
    </Link>
  );
}
