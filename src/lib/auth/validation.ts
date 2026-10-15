import { isRegisterableRole } from "@/types/roles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Min 10 chars with upper, lower, number, and special character. */
export const PASSWORD_RULES_HELP =
  "At least 10 characters, with uppercase, lowercase, a number, and a special character.";

export type RegisterInput = {
  email: string;
  password: string;
  role: string;
};

export type ValidationResult =
  | { ok: true; data: { email: string; password: string; role: "client" | "pilot" } }
  | { ok: false; error: string };

export function validatePasswordStrength(
  password: string,
): { ok: true } | { ok: false; error: string } {
  if (!password || password.length < 10) {
    return { ok: false, error: "Password must be at least 10 characters." };
  }
  if (!/[a-z]/.test(password)) {
    return {
      ok: false,
      error: "Password must include at least one lowercase letter.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      ok: false,
      error: "Password must include at least one uppercase letter.",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      ok: false,
      error: "Password must include at least one number.",
    };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      ok: false,
      error: "Password must include at least one special character.",
    };
  }
  return { ok: true };
}

export function validateRegisterInput(input: RegisterInput): ValidationResult {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";
  const role = input.role ?? "";

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.ok) {
    return { ok: false, error: passwordCheck.error };
  }

  if (!isRegisterableRole(role)) {
    return { ok: false, error: "Select Client or Pilot to register." };
  }

  return { ok: true, data: { email, password, role } };
}

export function validateLoginInput(input: {
  email?: string;
  password?: string;
}): { ok: true; email: string; password: string } | { ok: false; error: string } {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (!password) {
    return { ok: false, error: "Enter your password." };
  }

  return { ok: true, email, password };
}
