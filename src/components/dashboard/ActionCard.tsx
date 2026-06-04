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
    <>
      <div className="flex items-center gap-3 border-b border-border/80 pb-4">
        {icon ? <DashboardIconBox size="md">{icon}</DashboardIconBox> : null}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-5 flex-1 text-sm text-muted-foreground">{description}</p>
      {href ? (
        <p className="mt-4 text-sm font-medium text-gold-light">{ctaLabel} →</p>
      ) : null}
    </>
  );

  const classes = cn(
    "premium-card flex h-full flex-col p-6 transition-all duration-200",
    href && "hover:border-gold/40 hover:shadow-[var(--glow-gold)]",
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
