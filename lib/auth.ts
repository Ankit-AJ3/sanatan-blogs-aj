import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { customSession, emailOTP } from "better-auth/plugins";
import { headers } from "next/headers";
import { cache } from "react";
import { db, mongoClient } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, { client: mongoClient }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Readers must confirm their email with the OTP before they can sign in
    requireEmailVerification: true,
    autoSignIn: false,
  },
  emailVerification: {
    // Verifying the OTP logs the reader straight in
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      allowedAttempts: 5,
      // Send the code as soon as someone signs up, and use OTP for the
      // "verify your email" and "forgot password" flows.
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({ to: email, otp, type });
      },
    }),
    customSession(async ({ user, session }) => ({
      user: { ...user, isAdmin: isAdminEmail(user.email) },
      session,
    })),
    nextCookies(),
  ],
});

/** Current session (deduplicated per request). */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export function isAdminEmail(email?: string | null) {
  return !!email && adminEmails().includes(email.toLowerCase());
}

/** Google sign-in only works once both credentials are set. */
export const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export async function getAdmin() {
  const session = await getSession();
  return session && isAdminEmail(session.user.email) ? session : null;
}
