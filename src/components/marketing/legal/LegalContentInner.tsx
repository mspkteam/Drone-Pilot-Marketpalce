import { cn } from "@/lib/utils";

type LegalContentInnerProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Centered 1063px policy/legal body column.
 * Sits directly in the section (not inside public-container).
 * Hero/banner on the same page should keep public-container at 1280px.
 */
export function LegalContentInner({
  children,
  className,
}: LegalContentInnerProps) {
  return (
    <div className={cn("legal-content-inner", className)}>
      {children}
    </div>
  );
}
