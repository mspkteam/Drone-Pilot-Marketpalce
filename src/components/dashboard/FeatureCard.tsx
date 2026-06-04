import Link from "next/link";
import { DashboardIconBox } from "@/components/dashboard/DashboardIconBox";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  href?: string;
  ctaLabel?: string;
  className?: string;
};

/**
 * Feature / navigation module — same grid cell style as public profile modules.
 */
export function FeatureCard({
  title,
  description,
  icon,
  href,
  ctaLabel = "Open",
  className,
}: FeatureCardProps) {
  const inner = (
    <>
      <div className="dashboard-card-header">
        <div>
          {icon ? <DashboardIconBox size="md">{icon}</DashboardIconBox> : null}
          <h3 className="truncate text-base font-semibold text-foreground">
            {title}
          </h3>
        </div>
      </div>
      <div className="dashboard-card-body flex flex-col">
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {href ? (
          <p className="mt-4 shrink-0 text-sm font-medium text-gold-light">
            {ctaLabel} →
          </p>
        ) : null}
      </div>
    </>
  );

  const classes = cn(
    "dashboard-card dashboard-card-interactive flex h-full flex-col p-6",
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
