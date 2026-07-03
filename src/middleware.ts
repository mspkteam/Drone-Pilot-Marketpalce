import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { getAuthSecret } from "@/lib/auth/secret";
import { isPublicMarketingPathAllowed } from "@/lib/public-access";

function marketingPathGuard(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  if (isPublicMarketingPathAllowed(pathname)) {
    return null;
  }

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("locked", "1");
  return NextResponse.redirect(url);
}

async function middlewareWithoutAuth(req: NextRequest) {
  const blocked = marketingPathGuard(req);
  if (blocked) {
    return blocked;
  }

  return NextResponse.next();
}

const { auth } = NextAuth(authConfig);

const middlewareWithAuth = auth((req) => marketingPathGuard(req) ?? undefined);

export default getAuthSecret() ? middlewareWithAuth : middlewareWithoutAuth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
