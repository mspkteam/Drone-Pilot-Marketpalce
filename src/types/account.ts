import type { UserRole } from "@/types/roles";

export type AccountDto = {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  createdAt: string;
  unreadNotifications: number;
};
