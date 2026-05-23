import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { after } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { authLimiter, checkRateLimit, getClientIp } from "./rate-limit";
import { sendAdminSigninCode } from "./email";

const ADMIN_OTP_TTL_MINUTES = 10;

/**
 * Surfaced to the client via `result.code` from `signIn(..., { redirect: false })`.
 * The signin form watches for it and routes the user to /auth/verify-email.
 */
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

/**
 * Same idea — but for the admin two-factor flow. After a correct password,
 * we send a 6-digit code by email and ask the admin to enter it on
 * /auth/admin-verify before granting a session.
 */
class AdminOtpRequiredError extends CredentialsSignin {
  code = "admin_otp_required";
}

function generateOtp(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Throttle by IP first — refuses credential stuffing before we ever
        // touch the database or bcrypt-hash a password.
        const ip = getClientIp(request.headers);
        const { success } = await checkRateLimit(authLimiter, `signin:${ip}`);
        if (!success) {
          throw new Error("Too many sign-in attempts. Try again in a few minutes.");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        // Block unverified accounts so a stranger who guesses a real address
        // can't sign in before the owner does. The custom CredentialsSignin
        // subclass surfaces a `code` the signin form can route on.
        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        // Admin accounts get a second factor — issue a fresh OTP, send it,
        // and tell the client to redirect to /auth/admin-verify. Any prior
        // unconsumed OTPs for this user are invalidated so we can't have
        // two open challenges at once.
        if (user.role === "ADMIN") {
          const code = generateOtp();
          const codeHash = await bcrypt.hash(code, 10);
          await db.$transaction([
            db.adminOtp.updateMany({
              where: { userId: user.id, consumed: false },
              data: { consumed: true },
            }),
            db.adminOtp.create({
              data: {
                userId: user.id,
                codeHash,
                expiresAt: new Date(
                  Date.now() + ADMIN_OTP_TTL_MINUTES * 60_000
                ),
              },
            }),
          ]);
          after(() =>
            sendAdminSigninCode({
              to: user.email,
              adminName: user.firstName,
              code,
              expiresMinutes: ADMIN_OTP_TTL_MINUTES,
            })
          );
          throw new AdminOtpRequiredError();
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image,
        };
      },
    }),
    Credentials({
      id: "admin-otp",
      name: "admin-otp",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.code) return null;

        const ip = getClientIp(request.headers);
        const { success } = await checkRateLimit(
          authLimiter,
          `admin-otp:${ip}`
        );
        if (!success) {
          throw new Error("Too many attempts. Try again in a few minutes.");
        }

        const email = String(credentials.email).trim().toLowerCase();
        const code = String(credentials.code).trim();
        if (!/^\d{6}$/.test(code)) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || user.role !== "ADMIN") return null;

        const otp = await db.adminOtp.findFirst({
          where: {
            userId: user.id,
            consumed: false,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });
        if (!otp) return null;

        const matches = await bcrypt.compare(code, otp.codeHash);
        if (!matches) return null;

        await db.adminOtp.update({
          where: { id: otp.id },
          data: { consumed: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true, firstName: true, lastName: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    },
  },
});
