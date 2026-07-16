import type { BadgeIconType } from "@/types/admin-badges";

type BadgeWingIconProps = {
  type: BadgeIconType;
  className?: string;
  title?: string;
};

/** Professional gold-toned SVG glyphs for Badges & Wings (no emoji). */
export function BadgeWingIcon({ type, className, title }: BadgeWingIconProps) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    "aria-hidden": title ? undefined : (true as const),
    role: title ? ("img" as const) : undefined,
  };

  switch (type) {
    case "trophy":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M8 4h8v2.5c0 2.2-1.8 4-4 4s-4-1.8-4-4V4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M8 5.5H5.5A2.5 2.5 0 0 0 8 8M16 5.5h2.5A2.5 2.5 0 0 1 16 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 10.5V14M9 20h6M10.5 17h3V14h-3v3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M12 3.5l2.2 4.5 5 .7-3.6 3.5.9 5.1L12 15.4 7.5 17.3l.9-5.1L4.8 8.7l5-.7L12 3.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.18"
          />
        </svg>
      );
    case "lightning":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M13 3L6.5 13.5H11L10 21l7.5-12H13L13 3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.18"
          />
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <circle
            cx="12"
            cy="14"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path
            d="M9.5 9.5L8 3.5l4 2 4-2-1.5 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="14" r="1.75" fill="currentColor" />
        </svg>
      );
    case "star-outline":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M12 3.5l2.2 4.5 5 .7-3.6 3.5.9 5.1L12 15.4 7.5 17.3l.9-5.1L4.8 8.7l5-.7L12 3.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "award":
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <circle
            cx="12"
            cy="9"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path
            d="M9.2 13.2L8 20.5l4-2.2 4 2.2-1.2-7.3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.2 9.1l1.1 1.1L13.8 7.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

const ICON_TYPE_SET = new Set<string>([
  "trophy",
  "star",
  "lightning",
  "medal",
  "star-outline",
  "award",
]);

/** Resolve a stored iconLabel (type key or legacy glyph) to a BadgeIconType. */
export function resolveBadgeIconType(
  iconLabel: string | null | undefined,
  fallback: BadgeIconType = "star-outline",
): BadgeIconType {
  if (!iconLabel) return fallback;
  if (ICON_TYPE_SET.has(iconLabel)) return iconLabel as BadgeIconType;
  if (iconLabel.includes("★") || iconLabel.includes("☆")) return "star";
  if (iconLabel.includes("⚡")) return "lightning";
  if (iconLabel.includes("🏆")) return "trophy";
  if (iconLabel.includes("♛") || iconLabel.includes("🎖")) return "medal";
  if (iconLabel.includes("🏅") || iconLabel === "C" || iconLabel === "L") {
    return "award";
  }
  if (iconLabel === "✓" || iconLabel === "1" || iconLabel === "5" || iconLabel === "10") {
    return iconLabel === "1" ? "lightning" : iconLabel === "✓" ? "award" : "medal";
  }
  return fallback;
}
