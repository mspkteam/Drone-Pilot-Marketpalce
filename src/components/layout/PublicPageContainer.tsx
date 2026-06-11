import { cn } from "@/lib/utils";

type PublicPageContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Optional inner width constraint (e.g. contact form). Canvas stays 1280px. */
  innerClassName?: string;
};

/**
 * Centered marketing/public content canvas (max 1280px).
 * Section backgrounds can be full width; wrap inner content with this.
 */
export function PublicPageContainer({
  children,
  className,
  innerClassName,
}: PublicPageContainerProps) {
  return (
    <div className={cn("public-container", className)}>
      {innerClassName ? (
        <div className={cn("w-full", innerClassName)}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
