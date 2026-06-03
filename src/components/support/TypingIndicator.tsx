import { cn } from "@/lib/utils";

type TypingIndicatorProps = {
  /** Shown above the bubble, like a sender name. */
  label?: string;
  className?: string;
  /** Which side the bubble sits on (matches message alignment). */
  side?: "left" | "right";
};

export function TypingIndicator({
  label,
  className,
  side = "left",
}: TypingIndicatorProps) {
  const isLeft = side === "left";

  return (
    <div
      className={cn(
        "support-typing-bubble-wrap flex max-w-[90%] flex-col gap-0.5",
        isLeft ? "mr-auto items-start" : "ml-auto items-end",
        className,
      )}
      aria-live="polite"
      aria-label={label ? `${label} is typing` : "Typing"}
    >
      {label ? (
        <span className="text-[10px] font-medium text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div
        className={cn(
          "support-typing-bubble inline-flex items-center px-2.5 py-2",
          isLeft
            ? "rounded-lg rounded-bl-sm border border-border bg-surface-elevated"
            : "rounded-lg rounded-br-sm bg-gold/15",
        )}
      >
        <span className="flex h-3.5 items-center gap-1" aria-hidden>
          <span className="support-typing-dot" />
          <span className="support-typing-dot [animation-delay:160ms]" />
          <span className="support-typing-dot [animation-delay:320ms]" />
        </span>
      </div>
    </div>
  );
}
