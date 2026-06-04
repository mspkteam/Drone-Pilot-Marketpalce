import Link from "next/link";
import { DashboardIconBox } from "@/components/dashboard/DashboardIconBox";
import { cn } from "@/lib/utils";

type ActionCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  href?: string;
  ctaLabel?: string;
  className?: string;
};

/**
 * Prominent CTA module — gold-accent panel for primary dashboard actions.
 */
export function ActionCard({
  title,
  description,
  icon,
  href,
  ctaLabel = "Open",
  className,
}: ActionCardProps) {
  const inner = (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-4">
        {icon ? <DashboardIconBox>{icon}</DashboardIconBox> : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {href ? (
        <p className="mt-5 text-sm font-medium text-gold-light">{ctaLabel} →</p>
      ) : null}
    </div>
  );

  const classes = cn(
    "premium-panel flex h-full flex-col border-gold/30 p-6 transition-all duration-200 sm:p-7",
    href && "hover:border-gold/50 hover:shadow-[var(--glow-gold)]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return <article className={classes}>{inner}</article>;
}
