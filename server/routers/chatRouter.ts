import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { conversations, messages, providerProfiles } from "../../drizzle/schema";
import { eq, and, desc, or } from "drizzle-orm";

// Lazy import to avoid circular dependency
async function sendNotif(userId: number, data: object) {
  try {
    const mod = await import("../_core/index");
    if (typeof (mod as any).sendRealtimeNotification === "function") {
      (mod as any).sendRealtimeNotification(userId, data);
    }
  } catch {}
}

export const chatRouter = router({
  startConversation: protectedProcedure.input(z.object({
    providerId: z.number(),
    bookingId: z.number().optional(),
    subject: z.string().optional(),
    firstMessage: z.string().min(1),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [existing] = await db.select().from(conversations)
      .where(and(
        eq(conversations.customerId, ctx.user.id),
        eq(conversations.providerId, input.providerId),
        eq(conversations.status, "open"),
      )).limit(1);

    let convId = existing?.id;
    if (!convId) {
      const result = await db.insert(conversations).values({
        customerId: ctx.user.id,
        providerId: input.providerId,
        bookingId: input.bookingId,
        subject: input.subject ?? "استفسار عام",
        lastMessageAt: new Date(),
      });
      convId = (result as any).insertId;
    }

    await db.insert(messages).values({
      conversationId: convId,
      senderId: ctx.user.id,
      senderRole: "customer",
      content: input.firstMessage,
    });

    await db.update(conversations).set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, convId));

    const [provider] = await db.select({ userId: providerProfiles.userId })
      .from(providerProfiles).where(eq(providerProfiles.id, input.providerId)).limit(1);
    if (provider) {
      await sendNotif(provider.userId, {
        type: "new_message",
        title: "رسالة جديدة",
        message: input.firstMessage.substring(0, 80),
        conversationId: convId,
      });
    }

    return { conversationId: convId };
  }),

  sendMessage: protectedProcedure.input(z.object({
    conversationId: z.number(),
    content: z.string().min(1).max(2000),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [conv] = await db.select().from(conversations)
      .where(and(
        eq(conversations.id, input.conversationId),
        or(eq(conversations.customerId, ctx.user.id), eq(conversations.providerId, ctx.user.id)),
      )).limit(1);
    if (!conv) throw new TRPCError({ code: "NOT_FOUND" });

    const role = conv.customerId === ctx.user.id ? "customer" : "provider";
    await db.insert(messages).values({
      conversationId: input.conversationId,
      senderId: ctx.user.id,
      senderRole: role,
      content: input.content,
    });
    await db.update(conversations).set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, input.conversationId));

    if (role === "customer") {
      const [provUser] = await db.select({ userId: providerProfiles.userId })
        .from(providerProfiles).where(eq(providerProfiles.id, conv.providerId)).limit(1);
      if (provUser) await sendNotif(provUser.userId, { type: "new_message", title: "رسالة جديدة", message: input.content.substring(0, 80) });
    } else {
      await sendNotif(conv.customerId, { type: "new_message", title: "رد من المزود", message: input.content.substring(0, 80) });
    }

    return { success: true };
  }),

  getMessages: protectedProcedure.input(z.object({
    conversationId: z.number(),
    limit: z.number().default(50),
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const [conv] = await db.select().from(conversations)
      .where(and(
        eq(conversations.id, input.conversationId),
        or(eq(conversations.customerId, ctx.user.id), eq(conversations.providerId, ctx.user.id)),
      )).limit(1);
    if (!conv) throw new TRPCError({ code: "FORBIDDEN" });

    await db.update(messages).set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(messages.conversationId, input.conversationId),
        eq(messages.isRead, false),
      ));

    return db.select().from(messages)
      .where(eq(messages.conversationId, input.conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(input.limit);
  }),

  listMyConversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(conversations)
      .where(or(eq(conversations.customerId, ctx.user.id), eq(conversations.providerId, ctx.user.id)))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(20);
  }),
});
