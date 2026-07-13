import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { authUsers, authSessions, authAccounts, authVerifications } from "@/db/schema";

// Collect all possible trusted origins to avoid session rejection in prod
const baseUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

const trustedOrigins = [
  ...(process.env.NODE_ENV === "development"
    ? [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
      ]
    : []),
  ...(baseUrl ? [baseUrl] : []),
  ...(vercelUrl ? [vercelUrl] : []),
];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUsers,
      session: authSessions,
      account: authAccounts,
      verification: authVerifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  trustedOrigins,
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
