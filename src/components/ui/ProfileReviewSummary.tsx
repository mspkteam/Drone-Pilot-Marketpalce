import { cn } from "@/lib/utils";

export type ReviewRow = {
  label: string;
  value: string;
};

type ProfileReviewSummaryProps = {
  rows: ReviewRow[];
  className?: string;
};

export function ProfileReviewSummary({ rows, className }: ProfileReviewSummaryProps) {
  return (
    <dl className={cn("list-panel overflow-hidden", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        >
          <dt className="text-sm text-muted-foreground">{row.label}</dt>
          <dd className="text-sm font-medium text-foreground sm:max-w-[60%] sm:text-right">
            {row.value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
