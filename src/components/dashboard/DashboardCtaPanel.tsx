import { cn } from "@/lib/utils";

type DashboardCtaPanelProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

/** Bottom CTA band — matches public pilot profile hire section. */
export function DashboardCtaPanel({
  title,
  description,
  children,
  className,
}: DashboardCtaPanelProps) {
  return (
    <section
      className={cn(
        "dashboard-cta-panel px-6 py-8 text-center sm:px-10 sm:py-10",
        className,
      )}
    >
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children ? (
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
          {children}
        </div>
      ) : null}
    </section>
  );
}
