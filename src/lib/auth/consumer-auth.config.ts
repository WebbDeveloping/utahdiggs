import type { NextAuthConfig } from "next-auth";

export const consumerAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoginPage = pathname === "/login";
      const isSignupPage = pathname === "/signup";
      const isLoggedIn = !!auth?.user;

      if (isLoginPage || isSignupPage) {
        return isLoggedIn ? Response.redirect(new URL("/account", request.nextUrl)) : true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
