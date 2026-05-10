import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, or } from "drizzle-orm";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { sendEmail, buildVerificationEmail } from "../email";
import { encrypt, decrypt, maskSensitive } from "../encryption";
import {
  users,
  bookings,
  hajjBookingRequests,
  umrahBookingRequests,
} from "../../drizzle/schema";
import { sdk } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "../_core/env";

const googleClient = new OAuth2Client();

// ── helpers ───────────────────────────────────────────────────────────────────
async function createLocalSession(user: { openId: string; name: string | null }) {
  return sdk.signSession(
    { openId: user.openId, appId: ENV.appId || "go-umrah-local", name: user.name || "" },
    { expiresInMs: ONE_YEAR_MS }
  );
}

async function sendVerificationEmail(email: string, token: string, name: string) {
  const base = ENV.isProduction ? "https://go-umrah.com" : "http://localhost:3000";
  const verifyUrl = `${base}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: "تفعيل بريدك الإلكتروني - Go Umrah",
    html: buildVerificationEmail(name, verifyUrl),
  });
  return { verifyUrl, devToken: token };
}

// ── router ────────────────────────────────────────────────────────────────────
export const profileRouter = router({

  // ── Get profile ───────────────────────────────────────────────────────────
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        avatar: users.avatar,
        bio: users.bio,
        nationality: users.nationality,
        passportNumber: users.passportNumber,
        emailVerified: users.emailVerified,
        loginMethod: users.loginMethod,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
    // Mask passport number for display (PDPL compliance)
    return {
      ...user,
      passportNumber: user.passportNumber
        ? maskSensitive(decrypt(user.passportNumber))
        : null,
    };
  }),

  // ── Update profile ────────────────────────────────────────────────────────
  update: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100).optional(),
      phone: z.string().max(30).optional().nullable(),
      bio: z.string().max(500).optional().nullable(),
      nationality: z.string().max(100).optional().nullable(),
      passportNumber: z.string().max(50).optional().nullable(),
      avatar: z.string().url().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Encrypt passportNumber before storing (PDPL compliance)
      const updateData = { ...input, updatedAt: new Date() };
      if (input.passportNumber) {
        updateData.passportNumber = encrypt(input.passportNumber);
      }
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  // ── Change password ───────────────────────────────────────────────────────
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [user] = await db
        .select({ passwordHash: users.passwordHash, loginMethod: users.loginMethod })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "حسابك مرتبط بـ Google. لا يمكن تغيير كلمة المرور.",
        });
      }

      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور الحالية غير صحيحة" });
      }

      const newHash = await bcrypt.hash(input.newPassword, 12);
      await db.update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  // ── Get user bookings ─────────────────────────────────────────────────────
  getBookings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const mainBookings = await db
      .select({
        id: bookings.id,
        bookingNumber: bookings.bookingNumber,
        serviceType: bookings.serviceType,
        serviceName: bookings.serviceName,
        status: bookings.status,
        totalUSD: bookings.totalUSD,
        currency: bookings.currency,
        checkIn: bookings.checkIn,
        checkOut: bookings.checkOut,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(eq(bookings.userId, ctx.user.id))
      .orderBy(desc(bookings.createdAt))
      .limit(20);

    const hajjRequests = await db
      .select({
        id: hajjBookingRequests.id,
        packageTitle: hajjBookingRequests.packageTitle,
        status: hajjBookingRequests.status,
        createdAt: hajjBookingRequests.createdAt,
      })
      .from(hajjBookingRequests)
      .where(eq(hajjBookingRequests.customerEmail, ctx.user.email ?? ""))
      .orderBy(desc(hajjBookingRequests.createdAt))
      .limit(10);

    const umrahRequests = await db
      .select({
        id: umrahBookingRequests.id,
        packageTitle: umrahBookingRequests.packageTitle,
        status: umrahBookingRequests.status,
        createdAt: umrahBookingRequests.createdAt,
      })
      .from(umrahBookingRequests)
      .where(eq(umrahBookingRequests.customerEmail, ctx.user.email ?? ""))
      .orderBy(desc(umrahBookingRequests.createdAt))
      .limit(10);

    return { bookings: mainBookings, hajjRequests, umrahRequests };
  }),

  // ── Send email verification ───────────────────────────────────────────────
  sendVerification: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [user] = await db
      .select({ email: users.email, name: users.name, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user?.email) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يوجد بريد إلكتروني مرتبط بحسابك" });
    if (user.emailVerified) throw new TRPCError({ code: "BAD_REQUEST", message: "البريد الإلكتروني محقق بالفعل" });

    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.update(users)
      .set({ verificationToken: token, verificationTokenExpiry: expiry })
      .where(eq(users.id, ctx.user.id));

    const result = await sendVerificationEmail(user.email, token, user.name ?? "");
    return { success: true, devToken: result.devToken };
  }),

  // ── Verify email token ────────────────────────────────────────────────────
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.verificationToken, input.token))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "رمز التحقق غير صالح" });
      if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد." });
      }

      await db.update(users)
        .set({ emailVerified: true, verificationToken: null, verificationTokenExpiry: null })
        .where(eq(users.id, user.id));

      const sessionToken = await createLocalSession(user);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true, name: user.name };
    }),

  // ── Google OAuth login/register ───────────────────────────────────────────
  googleLogin: publicProcedure
    .input(z.object({
      idToken: z.string().min(1),
      clientId: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      let payload: { sub?: string; email?: string; name?: string; picture?: string };
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: input.idToken,
          audience: input.clientId,
        });
        payload = ticket.getPayload() ?? {};
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "رمز Google غير صالح" });
      }

      const { sub: googleId, email, name, picture } = payload;
      if (!googleId || !email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "بيانات Google غير مكتملة" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existingUser] = await db
        .select()
        .from(users)
        .where(or(eq(users.googleId, googleId), eq(users.email, email)))
        .limit(1);

      let finalUser: { openId: string; name: string | null };

      if (existingUser) {
        if (!existingUser.googleId) {
          await db.update(users)
            .set({ googleId, avatar: picture ?? existingUser.avatar, emailVerified: true, loginMethod: "google", lastSignedIn: new Date() })
            .where(eq(users.id, existingUser.id));
        } else {
          await db.update(users)
            .set({ lastSignedIn: new Date() })
            .where(eq(users.id, existingUser.id));
        }
        finalUser = { openId: existingUser.openId, name: existingUser.name };
      } else {
        const newOpenId = `google_${randomBytes(16).toString("hex")}`;
        await db.insert(users).values({
          openId: newOpenId,
          email,
          name: name ?? email.split("@")[0],
          googleId,
          avatar: picture,
          emailVerified: true,
          loginMethod: "google",
          role: "user",
          lastSignedIn: new Date(),
        });
        finalUser = { openId: newOpenId, name: name ?? null };
      }

      const sessionToken = await createLocalSession(finalUser);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true };
    }),

  // ── Upload avatar image ──────────────────────────────────────────────────────────────────────────────────
  uploadAvatar: protectedProcedure
    .input(z.object({
      base64: z.string().min(1),
      mimeType: z.string().default("image/jpeg"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Validate size (max 5MB base64 ≈ 3.75MB raw)
      if (input.base64.length > 7 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "حجم الصورة كبير جداً. الحد الأقصى 5 ميغابايت." });
      }
      const buffer = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
      const ext = input.mimeType === "image/png" ? "png" : input.mimeType === "image/webp" ? "webp" : "jpg";
      const key = `avatars/${ctx.user.id}-${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      // Update user avatar in DB
      await db.update(users)
        .set({ avatar: url, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id));
      return { url };
    }),
});
