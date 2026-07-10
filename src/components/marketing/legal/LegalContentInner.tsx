import { cn } from "@/lib/utils";

type LegalContentInnerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Policy/legal body column — same width and horizontal padding as marketing heroes
 * (`public-container` / 1280px canvas).
 */
export function LegalContentInner({
  children,
  className,
}: LegalContentInnerProps) {
  return (
    <div className={cn("public-container", className)}>
      {children}
    </div>
  );
}
