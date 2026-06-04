import type { NextAuthConfig } from "next-auth";
import {
  canAccessAdminPath,
  canAccessDashboard,
  getDashboardHomeForRole,
  getDashboardTypeFromPath,
} from "@/lib/auth/permissions";
import { getAuthSecret } from "@/lib/auth/secret";
import type { UserRole } from "@/types/roles";

/**
 * Edge-safe Auth.js config (no Prisma).
 * Used by middleware. Extended in auth.ts with the Credentials provider.
 */
export const authConfig = {
  secret: getAuthSecret(),
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role as UserRole | undefined;

      if (pathname === "/login" || pathname === "/register") {
        if (isLoggedIn && role) {
          return Response.redirect(
            new URL(getDashboardHomeForRole(role), request.nextUrl),
          );
        }
        return true;
      }

      if (!pathname.startsWith("/dashboard")) {
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (!role) {
        return false;
      }

      const dashboardType = getDashboardTypeFromPath(pathname);
      if (dashboardType && !canAccessDashboard(role, dashboardType)) {
        return Response.redirect(
          new URL(getDashboardHomeForRole(role), request.nextUrl),
        );
      }

      if (dashboardType === "admin" && !canAccessAdminPath(role, pathname)) {
        return Response.redirect(new URL("/dashboard/admin", request.nextUrl));
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
