import Image from "next/image";
import Link from "next/link";
import { homeAssets } from "@/lib/marketing/home-assets";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  /** Header uses compact size; footer uses larger mark from Figma */
  size?: "header" | "footer";
};

export function Logo({ variant = "dark", className, size = "header" }: LogoProps) {
  const dimensions =
    size === "footer"
      ? { width: 77, height: 79, className: "h-[4.9rem] w-[4.8rem]" }
      : { width: 50, height: 52, className: "h-[3.25rem] w-[3.15rem]" };

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center",
        variant === "light" ? "text-sidebar-foreground" : "text-foreground",
        className,
      )}
      aria-label="Remote Air Service — home"
    >
      <Image
        src={size === "footer" ? homeAssets.logoFooter : homeAssets.logo}
        alt="Remote Air Service"
        width={dimensions.width}
        height={dimensions.height}
        className={cn("object-contain", dimensions.className)}
        priority={size === "header"}
      />
    </Link>
  );
}
