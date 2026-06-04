import Link from "next/link";
import { DashboardIconBox } from "@/components/dashboard/DashboardIconBox";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  icon: React.ReactNode;
  value?: string;
  helperText?: string;
  children?: React.ReactNode;
  href?: string;
  className?: string;
};

/**
 * Compact metric box with gold accent — for dashboard stats grids.
 */
export function StatCard({
  label,
  icon,
  value,
  helperText,
  children,
  href,
  className,
}: StatCardProps) {
  const content = (
    <>
      <DashboardIconBox size="md">{icon}</DashboardIconBox>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      {children ? (
        <div className="mt-3 flex-1">{children}</div>
      ) : (
        <p className="mt-2 text-2xl font-bold tracking-tight text-gold-light">
          {value ?? "—"}
        </p>
      )}
      {helperText ? (
        <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </>
  );

  const classes = cn(
    "premium-card flex h-full flex-col p-6 transition-shadow duration-200",
    href && "hover:border-gold/40 hover:shadow-[var(--glow-gold)]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <article className={classes}>{content}</article>;
}
