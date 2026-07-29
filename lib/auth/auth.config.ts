import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config shared between the full NextAuth setup (lib/auth/auth.ts, Node runtime)
 * and middleware.ts (Edge runtime). Must stay free of Node-only imports like Prisma/pg —
 * the Credentials provider's `authorize` (which needs the DB) lives only in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  providers: [],
};
