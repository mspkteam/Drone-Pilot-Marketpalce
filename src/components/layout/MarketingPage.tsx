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
    <div
      className={cn(
        "mx-auto px-4 py-12 sm:px-6 sm:py-16",
        narrow ? "max-w-3xl" : "max-w-6xl",
      )}
    >
      <PageHeader title={title} description={description} badge={badge} />
      <div className="mt-10">
        {children ?? (
          <PlaceholderCard
            title="Content coming soon"
            description="This marketing page shell is ready. Copy and features will be added in module M17."
            moduleId="M17"
          />
        )}
      </div>
    </div>
  );
}
