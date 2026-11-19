export type RegisterableRole = "client" | "pilot";

export function uniqueEmail(role: RegisterableRole): string {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return `qa.${role}.${stamp}@example.test`;
}

export function strongPassword(): string {
  return `QaTemp!${Date.now().toString().slice(-6)}A1`;
}

export type CreatedUser = {
  role: RegisterableRole;
  email: string;
  password: string;
};
