import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/crm/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoginPage = pathname === "/crm/login";
      const isLoggedIn = !!auth?.user;

      if (isLoginPage) {
        return isLoggedIn ? Response.redirect(new URL("/crm", request.nextUrl)) : true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
