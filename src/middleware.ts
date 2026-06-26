import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CONSUMER_SESSION_COOKIE = "utahdigs.consumer.session-token";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/account")) {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      cookieName: CONSUMER_SESSION_COOKIE,
    });

    if (!token?.sub) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "next",
        pathname + request.nextUrl.search,
      );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/crm")) {
    const isLoginPage = pathname === "/crm/login";
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      // Auth.js uses __Secure-authjs.session-token on HTTPS; default getToken does not.
      secureCookie: request.nextUrl.protocol === "https:",
    });
    const isLoggedIn = Boolean(token?.sub);

    if (isLoginPage) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL("/crm", request.url));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/crm/login", request.url));
    }

    if (pathname.startsWith("/crm/users") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/crm", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/crm/:path*", "/account/:path*"],
};
