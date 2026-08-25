import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { validateLoginInput } from "@/lib/auth/validation";
import { reactivateUserIfEligible } from "@/lib/account/deactivation";
import type { UserRole } from "@/types/roles";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = validateLoginInput({
            email: credentials?.email as string | undefined,
            password: credentials?.password as string | undefined,
          });

          if (!parsed.ok) return null;

          const user = await prisma.user.findUnique({
            where: { email: parsed.email },
          });

          if (!user) return null;

          const valid = await verifyPassword(parsed.password, user.passwordHash);
          if (!valid) return null;

          if (user.status === "deactivated") {
            const restored = await reactivateUserIfEligible(user.id);
            if (!restored.ok) return null;
          } else if (user.status !== "active") {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
          };
        } catch (err) {
          console.error("[auth] credentials authorize failed:", err);
          return null;
        }
      },
    }),
  ],
});
