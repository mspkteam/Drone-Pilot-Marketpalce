import Link from "next/link";
import { DashboardIconBox } from "@/components/dashboard/DashboardIconBox";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  helperText?: string;
  footer?: React.ReactNode;
  href?: string;
  className?: string;
  /** Stronger gold border for primary module cards. */
  emphasis?: boolean;
};

/**
 * Module / navigation card — separate info box in feature grids.
 */
export function FeatureCard({
  title,
  description,
  icon,
  helperText,
  footer,
  href,
  className,
  emphasis = false,
}: FeatureCardProps) {
  const inner = (
    <>
      {icon ? (
        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <DashboardIconBox size="sm">{icon}</DashboardIconBox>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </div>
      ) : (
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      )}
      {description ? (
        <p
          className={cn(
            "text-sm leading-relaxed text-muted-foreground",
            icon ? "mt-5" : "mt-2",
          )}
        >
          {description}
        </p>
      ) : null}
      {helperText ? (
        <p className="mt-3 text-xs text-muted-foreground">{helperText}</p>
      ) : null}
      {footer ? <div className="mt-4 flex flex-wrap gap-2">{footer}</div> : null}
    </>
  );

  const classes = cn(
    "premium-card flex h-full flex-col p-6 transition-all duration-200",
    emphasis && "border-gold/35 shadow-[0_0_20px_rgba(201,162,39,0.08)]",
    href && "hover:border-gold/45 hover:shadow-[var(--glow-gold)]",
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
