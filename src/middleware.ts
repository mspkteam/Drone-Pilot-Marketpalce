import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { getAuthSecret } from "@/lib/auth/secret";

/** Skip Edge auth when secret is missing (avoids MIDDLEWARE_INVOCATION_FAILED on Vercel). */
export default getAuthSecret()
  ? NextAuth(authConfig).auth
  : function middleware() {
      return undefined;
    };

export const config = {
  // Auth pages stay off Edge middleware so missing AUTH_SECRET does not 500 /login.
  matcher: ["/dashboard/:path*"],
};
