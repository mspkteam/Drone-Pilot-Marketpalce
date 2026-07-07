/**
 * Public (marketing) page visibility — independent of dashboard milestone locks.
 * Backend may be ahead; the frontend only shows paths listed here until you unlock more.
 *
 * Override without a deploy: set NEXT_PUBLIC_UNLOCKED_PUBLIC_PATHS (comma-separated paths).
 * Example: "/", "/for-clients", "/how-it-works"
 */

/** Always reachable — auth and static assets are excluded from the marketing matcher. */
export const ALWAYS_UNLOCKED_PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/waitlist",
] as const;

/**
 * Marketing pages visible on production (full public marketing site).
 * Prefix matching unlocks nested routes (e.g. `/resources` → `/resources/[slug]`, `/pilots` → `/pilots/[id]`).
 */
export const DEFAULT_UNLOCKED_PUBLIC_PATHS = [
  "/",
  "/for-clients",
  "/for-pilots",
  "/how-it-works",
  "/pricing",
  "/safety",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/cookies",
  "/resources",
  "/pilots",
  "/captains-club",
  "/reputation",
] as const;

function normalizePublicPath(pathname: string): string {
  if (!pathname) return "/";
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function getUnlockedPublicPaths(): readonly string[] {
  const raw = process.env.NEXT_PUBLIC_UNLOCKED_PUBLIC_PATHS?.trim();
  if (!raw) return DEFAULT_UNLOCKED_PUBLIC_PATHS;

  const paths = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(normalizePublicPath);

  return paths.length > 0 ? paths : DEFAULT_UNLOCKED_PUBLIC_PATHS;
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  const normalized = normalizePublicPath(pathname);
  const base = normalizePublicPath(prefix);
  if (base === "/") return normalized === "/";
  return normalized === base || normalized.startsWith(`${base}/`);
}

export function isAlwaysUnlockedPublicPath(pathname: string): boolean {
  return ALWAYS_UNLOCKED_PUBLIC_PREFIXES.some((prefix) =>
    pathMatchesPrefix(pathname, prefix),
  );
}

export function isPublicMarketingPathAllowed(pathname: string): boolean {
  if (isAlwaysUnlockedPublicPath(pathname)) return true;

  const unlocked = getUnlockedPublicPaths();
  return unlocked.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

export function isMarketingNavHrefVisible(href: string): boolean {
  const path = href.split("?")[0] ?? href;
  return isPublicMarketingPathAllowed(path);
}
