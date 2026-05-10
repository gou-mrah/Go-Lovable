import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { sdk } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "../_core/env";
import { sendEmail, buildPasswordResetEmail, buildVerificationEmail, buildWelcomeEmail } from "../email";

const SALT_ROUNDS = 12;

// Build a local JWT session using the same sdk.signSession mechanism
// IMPORTANT: name must be non-empty string — verifySession rejects tokens with empty name
async function createLocalSession(user: { openId: string; name: string | null; email?: string | null }) {
  // Fallback chain: name → email prefix → openId (to ensure non-empty name)
  const displayName = (user.name && user.name.trim()) || (user.email?.split('@')[0]) || user.openId;
  return sdk.signSession(
    {
      openId: user.openId,
      appId: ENV.appId || "go-umrah-local",
      name: displayName,
    },
    { expiresInMs: ONE_YEAR_MS }
  );
}

export const customAuthRouter = router({
  // ── Register ──────────────────────────────────────────────────────────────
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").max(100),
        email: z.string().email("البريد الإلكتروني غير صحيح").toLowerCase(),
        password: z
          .string()
          .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
          .max(128),
        phone: z.string().optional(),
        nationality: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة" });

      // Check if email already exists
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "البريد الإلكتروني مسجل مسبقاً",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
      const openId = `local_${randomBytes(16).toString("hex")}`;

      await db.insert(users).values({
        openId,
        name: input.name,
        email: input.email,
        passwordHash,
        loginMethod: "email",
        emailVerified: false,
        role: "user",
        lastSignedIn: new Date(),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.nationality ? { nationality: input.nationality } : {}),
      });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1)
        .then((r) => r[0]);

      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const token = await createLocalSession(user);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Send welcome email (fire and forget)
      if (user.email) {
        sendEmail({
          to: user.email,
          subject: "أهلاً بك في Go Umrah — بوابتك للرحلة المقدسة",
          html: buildWelcomeEmail(user.name ?? "المستخدم"),
        }).catch((e) => console.error("[Email] Welcome email failed:", e));
      }

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      };
    }),

  // ── Login ─────────────────────────────────────────────────────────────────
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة" });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1)
        .then((r) => r[0]);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }

      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      const token = await createLocalSession(user);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      };
    }),

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME, { path: "/" });
    return { success: true };
  }),

  // ── Me ────────────────────────────────────────────────────────────────────
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const db = await getDb();
    if (!db) return null;
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        loginMethod: users.loginMethod,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1)
      .then((r) => r[0]);
    return user ?? null;
  }),

  // ── Forgot Password ───────────────────────────────────────────────────────
  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email().toLowerCase() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: true };

      const user = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1)
        .then((r) => r[0]);

      // Always return success to prevent email enumeration
      if (!user) return { success: true };

      const token = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db
        .update(users)
        .set({ resetToken: token, resetTokenExpiry: expiry })
        .where(eq(users.id, user.id));

      // Send password reset email
      const origin = ENV.isProduction ? "https://go-umrah.com" : "http://localhost:3000";
      const resetUrl = `${origin}/reset-password?token=${token}`;
      await sendEmail({
        to: user.email!,
        subject: "إعادة تعيين كلمة المرور - Go Umrah",
        html: buildPasswordResetEmail(user.name ?? "المستخدم", resetUrl),
      });
      const isDev = process.env.NODE_ENV !== "production";
      return {
        success: true,
        ...(isDev ? { devToken: token } : {}),
      };
    }),

  // ── Reset Password ────────────────────────────────────────────────────────
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        password: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.resetToken, input.token),
            gt(users.resetTokenExpiry, new Date())
          )
        )
        .limit(1)
        .then((r) => r[0]);

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
      await db
        .update(users)
        .set({
          passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
          lastSignedIn: new Date(),
        })
        .where(eq(users.id, user.id));

      // Auto-login after reset
      const token = await createLocalSession(user);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true };
    }),

  // ── Update Profile ────────────────────────────────────────────────────────
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        currentPassword: z.string().optional(),
        newPassword: z.string().min(8).max(128).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1)
        .then((r) => r[0]);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const updates: Record<string, unknown> = {};
      if (input.name) updates.name = input.name;

      if (input.newPassword) {
        if (!input.currentPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "يجب إدخال كلمة المرور الحالية",
          });
        }
        if (!user.passwordHash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "لا يمكن تغيير كلمة المرور لهذا الحساب",
          });
        }
        const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!valid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "كلمة المرور الحالية غير صحيحة",
          });
        }
        updates.passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
      }

      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, user.id));
      }

      return { success: true };
    }),
});
