/** Auth.js secret — supports legacy NEXTAUTH_SECRET for Vercel dashboards. */
export function getAuthSecret(): string | undefined {
  const value =
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  return value || undefined;
}
