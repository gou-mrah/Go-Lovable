import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

async function getSetting(db: any, key: string): Promise<string | null> {
  const [row] = await db
    .select({ id: siteSettings.id, key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);
  return row?.value ?? null;
}

async function setSetting(db: any, key: string, value: string): Promise<void> {
  // Upsert: try update first, then insert if not exists
  const existing = await db
    .select({ id: siteSettings.id, key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);
  if (existing.length > 0) {
    await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value });
  }
}

export const siteSettingsRouter = router({
  // Public: get site status (for app entry point check)
  getStatus: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { isOpen: true, message: "", title: "", launchDate: null as string | null };
    const isOpenVal = await getSetting(db, "site_is_open");
    const message = await getSetting(db, "maintenance_message");
    const title = await getSetting(db, "maintenance_title");
    const launchDate = await getSetting(db, "launch_date");
    return {
      isOpen: isOpenVal !== "false",
      message: message ?? "انتظروا منصة جو عمرة في حلتها الجديدة",
      title: title ?? "قريباً...",
      launchDate: launchDate ?? null,
    };
  }),

  // Admin: get full settings
  getAdminSettings: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const isOpenVal = await getSetting(db, "site_is_open");
    const message = await getSetting(db, "maintenance_message");
    const title = await getSetting(db, "maintenance_title");
    const launchDate = await getSetting(db, "launch_date");
    return {
      isOpen: isOpenVal !== "false",
      message: message ?? "انتظروا منصة جو عمرة في حلتها الجديدة",
      title: title ?? "قريباً...",
      launchDate: launchDate ?? null,
    };
  }),

  // Admin: toggle site open/close
  toggleSite: adminProcedure
    .input(z.object({ isOpen: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await setSetting(db, "site_is_open", input.isOpen ? "true" : "false");
      return { success: true, isOpen: input.isOpen };
    }),

  // Admin: update maintenance message and title
  updateMessage: adminProcedure
    .input(z.object({
      message: z.string().min(1).max(500),
      title: z.string().min(1).max(200).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await setSetting(db, "maintenance_message", input.message);
      if (input.title) {
        await setSetting(db, "maintenance_title", input.title);
      }
      return { success: true };
    }),

  // Admin: set launch date (ISO string like "2026-04-01T00:00:00.000Z")
  setLaunchDate: adminProcedure
    .input(z.object({
      launchDate: z.string().nullable(), // null to clear
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await setSetting(db, "launch_date", input.launchDate ?? "");
      return { success: true };
    }),
});
