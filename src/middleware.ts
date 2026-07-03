import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { getAuthSecret } from "@/lib/auth/secret";
import { isPublicMarketingPathAllowed } from "@/lib/public-access";

const authMiddleware = getAuthSecret()
  ? NextAuth(authConfig).auth
  : null;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (authMiddleware) {
      return authMiddleware(req);
    }
    return NextResponse.next();
  }

  if (!isPublicMarketingPathAllowed(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("locked", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
