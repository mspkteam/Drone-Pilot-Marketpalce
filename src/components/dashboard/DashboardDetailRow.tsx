type DashboardDetailRowProps = {
  label: string;
  value: string;
};

export function DashboardDetailRow({ label, value }: DashboardDetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
