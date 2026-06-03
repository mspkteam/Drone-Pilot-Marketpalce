import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="text-gold" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "mt-0 block w-full rounded-lg border border-border bg-[var(--input-bg)] px-3 py-2.5 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-200 hover:border-gold/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/35 disabled:cursor-not-allowed disabled:opacity-50";

export const selectClassName = inputClassName;

export const textareaClassName =
  "mt-0 block w-full min-h-[7rem] resize-y rounded-lg border border-border bg-[var(--input-bg)] px-3 py-2.5 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-200 hover:border-gold/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/35 disabled:cursor-not-allowed disabled:opacity-50";
