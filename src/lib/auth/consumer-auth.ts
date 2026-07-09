import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { consumerAuthConfig } from "@/lib/auth/consumer-auth.config";

export type ConsumerSessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...consumerAuthConfig,
  basePath: "/api/account-auth",
  session: { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: "glidere.consumer.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      id: "consumer-credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        const customer = await prisma.customer.findUnique({ where: { email } });

        if (!customer?.passwordHash) {
          return null;
        }

        const valid = await bcrypt.compare(password, customer.passwordHash);

        if (!valid) {
          return null;
        }

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        };
      },
    }),
  ],
  callbacks: {
    ...consumerAuthConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? "";
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    },
  },
});
