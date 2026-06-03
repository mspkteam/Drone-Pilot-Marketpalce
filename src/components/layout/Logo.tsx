import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function Logo({ variant = "dark", className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        variant === "light" ? "text-sidebar-foreground" : "text-foreground",
        className,
      )}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-md bg-gold text-xs font-bold text-accent-foreground"
        aria-hidden
      >
        DP
      </span>
      <span className="hidden sm:inline">
        Drone Pilot <span className="text-gold">Marketplace</span>
      </span>
      <span className="sm:hidden">DPM</span>
    </Link>
  );
}
