export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim() === "") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function configFromUrl(url: string): SmtpConfig | null {
  try {
    const parsed = new URL(url);
    const user = decodeURIComponent(parsed.username);
    const password = decodeURIComponent(parsed.password);
    if (!user || !password || !parsed.hostname) return null;
    const port = parsed.port
      ? Number(parsed.port)
      : parsed.protocol === "smtps:" || parsed.protocol === "https:"
        ? 465
        : 587;
    return {
      host: parsed.hostname,
      port: Number.isFinite(port) ? port : 465,
      secure: parsed.protocol === "smtps:" || port === 465,
      user,
      password,
      from: process.env.EMAIL_FROM?.trim() || user,
    };
  } catch {
    return null;
  }
}

export function getSmtpConfig(): SmtpConfig | null {
  const from =
    process.env.EMAIL_FROM?.trim() || "Remote Air Service <support@remoteairservice.com>";

  const url = process.env.SMTP_URL?.trim();
  if (url) {
    const fromUrl = configFromUrl(url);
    if (fromUrl) return { ...fromUrl, from };
  }

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  if (!host || !user || !password) return null;

  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : 465;
  const secure = parseBool(process.env.SMTP_SECURE, port === 465);

  return {
    host,
    port: Number.isFinite(port) ? port : 465,
    secure,
    user,
    password,
    from,
  };
}

export function isEmailDeliveryConfigured(): boolean {
  return getSmtpConfig() !== null;
}
