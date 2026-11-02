export function baseURL(): string {
  return process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
}

export function adminCredentials(): { email: string; password: string } {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Missing E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD. Copy e2e/.env.example to e2e/.env (local seed defaults).",
    );
  }
  return { email, password };
}

export function moderatorCredentials(): { email: string; password: string } {
  return {
    email: process.env.E2E_MODERATOR_EMAIL ?? "moderator@dronepilot.local",
    password: process.env.E2E_MODERATOR_PASSWORD ?? process.env.E2E_ADMIN_PASSWORD ?? "Demo123!",
  };
}
