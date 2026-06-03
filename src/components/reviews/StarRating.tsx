import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
};

export function StarRating({
  value,
  max = 5,
  size = "sm",
  className,
}: StarRatingProps) {
  const sizeClass = size === "md" ? "text-lg" : "text-sm";
  return (
    <span
      className={cn("inline-flex gap-0.5 text-gold", sizeClass, className)}
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span key={i} aria-hidden>
          {i < value ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function StarRatingInput({
  value,
  onChange,
  disabled,
}: StarRatingInputProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className={cn(
            "rounded px-1 text-2xl transition-colors hover:text-gold",
            star <= value ? "text-gold" : "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-pressed={star <= value}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
