import { PageHeader } from "@/components/layout/PageHeader";
import { PlaceholderCard } from "@/components/layout/PlaceholderCard";

type DashboardPageProps = {
  title: string;
  description: string;
  moduleId?: string;
  badge?: string;
};

export function DashboardPage({
  title,
  description,
  moduleId,
  badge,
}: DashboardPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} badge={badge} />
      <div className="mt-8">
        <PlaceholderCard
          title="Module not built yet"
          description="This route shell is part of Sprint 1 foundation. Business logic ships in the module noted below."
          moduleId={moduleId}
        />
      </div>
    </>
  );
}
