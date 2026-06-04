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
        <div className="flex min-w-0 items-center gap-3">
          {icon ? <DashboardIconBox size="md">{icon}</DashboardIconBox> : null}
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
        </div>
      </div>
      <p className="dashboard-card-body text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {href ? (
        <p className="mt-4 text-sm font-medium text-gold-light">{ctaLabel} →</p>
      ) : null}
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
