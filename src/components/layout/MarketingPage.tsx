import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderCard } from "@/components/layout/PlaceholderCard";
import { cn } from "@/lib/utils";

type MarketingPageProps = {
  title: string;
  description: string;
  badge?: string;
  narrow?: boolean;
  children?: React.ReactNode;
};

export function MarketingPage({
  title,
  description,
  badge,
  narrow,
  children,
}: MarketingPageProps) {
  return (
    <>
      <section className="marketing-hero border-b border-border">
        <div
          className={cn(
            "relative mx-auto px-4 py-14 sm:px-6 sm:py-20",
            narrow ? "max-w-3xl" : "max-w-6xl",
          )}
        >
          {badge ? (
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
              {badge}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-400">{description}</p>
        </div>
      </section>
      <div
        className={cn(
          "marketing-section",
          narrow ? "max-w-3xl" : "max-w-6xl",
        )}
      >
        {children ?? (
          <PlaceholderCard
            title="Content coming soon"
            description="This marketing page shell is ready. Final copy and layout will align to Figma."
            moduleId="M17"
          />
        )}
      </div>
    </>
  );
}
