const DEFAULT_METHODS = "POST, OPTIONS";
const DEFAULT_HEADERS = "Content-Type";

export function waitlistCorsHeaders(request: Request): HeadersInit {
  const allowed = (process.env.WAITLIST_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": DEFAULT_METHODS,
    "Access-Control-Allow-Headers": DEFAULT_HEADERS,
    Vary: "Origin",
  };

  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}
