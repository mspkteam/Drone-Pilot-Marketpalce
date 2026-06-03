import { cn } from "@/lib/utils";

type PremiumCardProps = {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
};

export function PremiumCard({
  children,
  className,
  glass = false,
}: PremiumCardProps) {
  return (
    <div className={cn(glass ? "glass-card" : "premium-card", "p-6", className)}>
      {children}
    </div>
  );
}
