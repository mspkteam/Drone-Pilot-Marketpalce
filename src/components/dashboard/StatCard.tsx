import Link from "next/link";
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
 * Stat metric card — aligned with public pilot profile `StatCard`.
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
      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/35 bg-gold/10 text-gold">
        {icon}
      </span>
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
    "dashboard-card flex h-full min-h-0 flex-col p-6 transition-[border-color,box-shadow] duration-200",
    href && "dashboard-card-interactive",
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
