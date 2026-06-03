import { isRegisterableRole } from "@/types/roles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterInput = {
  email: string;
  password: string;
  role: string;
};

export type ValidationResult =
  | { ok: true; data: { email: string; password: string; role: "client" | "pilot" } }
  | { ok: false; error: string };

export function validateRegisterInput(input: RegisterInput): ValidationResult {
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";
  const role = input.role ?? "";

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
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
