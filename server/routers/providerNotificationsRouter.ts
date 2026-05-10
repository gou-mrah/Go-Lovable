import { z } from "zod";
import { eq, and, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { providerNotifications, providerProfiles } from "../../drizzle/schema";

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

const providerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "provider" && ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Provider access required" });
  return next({ ctx });
});

export const providerNotificationsRouter = router({
  // ── Get my notifications ──────────────────────────────────────────────────
  list: providerProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const d = await getDbOrThrow();
      const profile = await getProviderProfile(ctx.user.id);
      const conditions: any[] = [eq(providerNotifications.providerId, profile.id)];
      if (input.unreadOnly) conditions.push(eq(providerNotifications.isRead, false));

      const rows = await d
        .select()
        .from(providerNotifications)
        .where(and(...conditions))
        .orderBy(desc(providerNotifications.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const unreadCount = await d
        .select({ total: count(providerNotifications.id) })
        .from(providerNotifications)
        .where(
          and(
            eq(providerNotifications.providerId, profile.id),
            eq(providerNotifications.isRead, false)
          )
        );

      return {
        notifications: rows,
        unreadCount: unreadCount[0]?.total ?? 0,
      };
    }),

  // ── Mark as read ──────────────────────────────────────────────────────────
  markRead: providerProcedure
    .input(
      z.object({
        notificationId: z.number().int().positive().optional(), // if omitted → mark all
      })
    )
    .mutation(async ({ input, ctx }) => {
      const d = await getDbOrThrow();
      const profile = await getProviderProfile(ctx.user.id);

      if (input.notificationId) {
        await d
          .update(providerNotifications)
          .set({ isRead: true })
          .where(
            and(
              eq(providerNotifications.id, input.notificationId),
              eq(providerNotifications.providerId, profile.id)
            )
          );
      } else {
        await d
          .update(providerNotifications)
          .set({ isRead: true })
          .where(eq(providerNotifications.providerId, profile.id));
      }

      return { success: true };
    }),

  // ── Delete a notification ─────────────────────────────────────────────────
  delete: providerProcedure
    .input(z.object({ notificationId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const d = await getDbOrThrow();
      const profile = await getProviderProfile(ctx.user.id);

      await d
        .delete(providerNotifications)
        .where(
          and(
            eq(providerNotifications.id, input.notificationId),
            eq(providerNotifications.providerId, profile.id)
          )
        );

      return { success: true };
    }),
});
