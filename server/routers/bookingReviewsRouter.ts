import { z } from "zod";
import { eq, and, desc, avg, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  bookingReviews,
  providerProfiles,
  providerBookings,
  providerNotifications,
} from "../../drizzle/schema";

async function getDbOrThrow() {
  const d = await getDb();
  if (!d) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
  return d;
}

async function getProviderProfile(userId: number, userName?: string) {
  const d = await getDbOrThrow();
  const rows = await d
    .select()
    .from(providerProfiles)
    .where(eq(providerProfiles.userId, userId))
    .limit(1);
  if (!rows.length) {
    // Auto-create a placeholder profile on first access
    const defaultName = userName ?? `Provider #${userId}`;
    await d.insert(providerProfiles).values({
      userId,
      companyName: defaultName,
      status: "pending",
    } as any);
    const created = await d.select().from(providerProfiles).where(eq(providerProfiles.userId, userId)).limit(1);
    return created[0];
  }
  return rows[0];
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

const providerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "provider" && ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Provider access required" });
  return next({ ctx });
});

export const bookingReviewsRouter = router({
  // ── Public: submit a review for a completed booking ──────────────────────
  submit: publicProcedure
    .input(
      z.object({
        bookingRef: z.string().min(3),
        providerId: z.number().int().positive(),
        programId: z.number().int().positive().optional(),
        customerName: z.string().min(2),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(255).optional(),
        comment: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const d = await getDbOrThrow();

      const booking = await d
        .select()
        .from(providerBookings)
        .where(eq(providerBookings.bookingRef, input.bookingRef))
        .limit(1);

      if (!booking.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "رقم الحجز غير موجود" });

      const existing = await d
        .select()
        .from(bookingReviews)
        .where(eq(bookingReviews.bookingRef, input.bookingRef))
        .limit(1);

      if (existing.length)
        throw new TRPCError({ code: "CONFLICT", message: "تم تقديم تقييم لهذا الحجز مسبقاً" });

      const isVerified = booking[0].status === "completed";

      await d.insert(bookingReviews).values({
        bookingRef: input.bookingRef,
        providerId: input.providerId,
        programId: input.programId ?? null,
        customerId: ctx.user?.id ?? null,
        customerName: input.customerName,
        rating: input.rating,
        title: input.title ?? null,
        comment: input.comment ?? null,
        status: "pending",
        isVerified,
      } as any);

      await d.insert(providerNotifications).values({
        providerId: input.providerId,
        type: "new_review",
        title: "تقييم جديد بانتظار المراجعة",
        message: `قدّم ${input.customerName} تقييماً بـ ${input.rating} نجوم`,
        isRead: false,
      } as any);

      return { success: true };
    }),

  // ── Public: get approved reviews for a provider ───────────────────────────
  getForProvider: publicProcedure
    .input(
      z.object({
        providerId: z.number().int().positive(),
        limit: z.number().int().min(1).max(50).default(10),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const d = await getDbOrThrow();

      const rows = await d
        .select()
        .from(bookingReviews)
        .where(
          and(
            eq(bookingReviews.providerId, input.providerId),
            eq(bookingReviews.status, "approved")
          )
        )
        .orderBy(desc(bookingReviews.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const stats = await d
        .select({
          avgRating: avg(bookingReviews.rating),
          total: count(bookingReviews.id),
        })
        .from(bookingReviews)
        .where(
          and(
            eq(bookingReviews.providerId, input.providerId),
            eq(bookingReviews.status, "approved")
          )
        );

      return {
        reviews: rows,
        avgRating: Number(stats[0]?.avgRating ?? 0),
        total: stats[0]?.total ?? 0,
      };
    }),

  // ── Provider: get all reviews for my programs ─────────────────────────────
  getMyReviews: providerProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const d = await getDbOrThrow();
      const profile = await getProviderProfile(ctx.user.id);
      const conditions: any[] = [eq(bookingReviews.providerId, profile.id)];
      if (input.status) conditions.push(eq(bookingReviews.status, input.status as any));

      return d
        .select()
        .from(bookingReviews)
        .where(and(...conditions))
        .orderBy(desc(bookingReviews.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // ── Provider: reply to a review ───────────────────────────────────────────
  reply: providerProcedure
    .input(
      z.object({
        reviewId: z.number().int().positive(),
        reply: z.string().min(5).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const d = await getDbOrThrow();
      const profile = await getProviderProfile(ctx.user.id);

      const review = await d
        .select()
        .from(bookingReviews)
        .where(
          and(eq(bookingReviews.id, input.reviewId), eq(bookingReviews.providerId, profile.id))
        )
        .limit(1);

      if (!review.length)
        throw new TRPCError({ code: "NOT_FOUND", message: "التقييم غير موجود" });

      await d
        .update(bookingReviews)
        .set({ providerReply: input.reply, providerRepliedAt: new Date() })
        .where(eq(bookingReviews.id, input.reviewId));

      return { success: true };
    }),

  // ── Admin: list all reviews ───────────────────────────────────────────────
  adminList: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        providerId: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(100).default(30),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const d = await getDbOrThrow();
      const conditions: any[] = [];
      if (input.status) conditions.push(eq(bookingReviews.status, input.status as any));
      if (input.providerId) conditions.push(eq(bookingReviews.providerId, input.providerId));

      return d
        .select()
        .from(bookingReviews)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(bookingReviews.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // ── Admin: approve / reject a review ─────────────────────────────────────
  adminUpdateStatus: adminProcedure
    .input(
      z.object({
        reviewId: z.number().int().positive(),
        status: z.enum(["approved", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      const d = await getDbOrThrow();

      await d
        .update(bookingReviews)
        .set({ status: input.status })
        .where(eq(bookingReviews.id, input.reviewId));

      if (input.status === "approved") {
        const review = await d
          .select()
          .from(bookingReviews)
          .where(eq(bookingReviews.id, input.reviewId))
          .limit(1);

        if (review.length) {
          const stats = await d
            .select({
              avgRating: avg(bookingReviews.rating),
              total: count(bookingReviews.id),
            })
            .from(bookingReviews)
            .where(
              and(
                eq(bookingReviews.providerId, review[0].providerId),
                eq(bookingReviews.status, "approved")
              )
            );

          await d
            .update(providerProfiles)
            .set({
              rating: String(Number(stats[0]?.avgRating ?? 0).toFixed(1)),
              reviewCount: stats[0]?.total ?? 0,
            })
            .where(eq(providerProfiles.id, review[0].providerId));
        }
      }

      return { success: true };
    }),

  // ── Admin: delete a review ────────────────────────────────────────────────
  adminDelete: adminProcedure
    .input(z.object({ reviewId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const d = await getDbOrThrow();
      await d.delete(bookingReviews).where(eq(bookingReviews.id, input.reviewId));
      return { success: true };
    }),
});
