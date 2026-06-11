import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-gold/30 bg-gold text-[var(--color-cta-dark)] shadow-[0_2px_12px_rgba(216,179,57,0.25)] hover:border-gold-light hover:bg-gold-light hover:text-[var(--color-cta-dark)] hover:shadow-[0_0_22px_rgba(216,179,57,0.38)] active:brightness-95 focus-visible:ring-gold",
  secondary:
    "border border-gold/45 bg-surface/80 text-white hover:border-gold hover:bg-gold/12 hover:text-white",
  ghost:
    "text-foreground hover:bg-white/6 hover:text-foreground",
  outline:
    "border border-border bg-surface/40 text-foreground hover:border-gold/45 hover:bg-gold/5 hover:text-gold-light",
  danger:
    "border border-destructive/45 bg-destructive/15 text-red-300 hover:border-destructive/60 hover:bg-destructive/22",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-5 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-xl",
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
} & (
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "className">)
);

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } =
    props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
