import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { subscriptionPlans, planAddons, providerSubscriptions, providerProfiles } from "../../drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

// Provider guard (provider or admin)
const providerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "provider" && ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Provider access required" });
  return next({ ctx });
});

async function getDbOrThrow() {
  const d = await getDb();
  if (!d) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
  return d;
}

export const subscriptionsRouter = router({
  // ─── Public ──────────────────────────────────────────────────────────────────

  listPlans: publicProcedure.query(async () => {
    const d = await getDbOrThrow();
    return d.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).orderBy(asc(subscriptionPlans.sortOrder));
  }),

  listAddons: publicProcedure.query(async () => {
    const d = await getDbOrThrow();
    return d.select().from(planAddons).where(eq(planAddons.isActive, true));
  }),

  // ─── Provider ─────────────────────────────────────────────────────────────────

  getMySubscription: providerProcedure.query(async ({ ctx }) => {
    const d = await getDbOrThrow();
    const profile = await d.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return null;

    const sub = await d
      .select()
      .from(providerSubscriptions)
      .where(eq(providerSubscriptions.providerId, profile[0].id))
      .orderBy(desc(providerSubscriptions.createdAt))
      .limit(1);
    if (!sub[0]) return null;

    const plan = await d.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, sub[0].planId)).limit(1);
    return { ...sub[0], plan: plan[0] ?? null };
  }),

  requestUpgrade: providerProcedure
    .input(z.object({
      planId: z.number(),
      billingCycle: z.enum(["monthly", "annual"]),
      addons: z.array(z.string()).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const d = await getDbOrThrow();
      const profile = await d.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
      if (!profile[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Provider profile not found" });

      const sub = await d
        .select()
        .from(providerSubscriptions)
        .where(eq(providerSubscriptions.providerId, profile[0].id))
        .orderBy(desc(providerSubscriptions.createdAt))
        .limit(1);

      if (sub[0]) {
        await d.update(providerSubscriptions).set({
          upgradeRequestedPlanId: input.planId,
          upgradeRequestedAt: new Date(),
          upgradeRequestedAddons: input.addons,
          status: "pending_payment",
        } as any).where(eq(providerSubscriptions.id, sub[0].id));
      } else {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        await d.insert(providerSubscriptions).values({
          providerId: profile[0].id,
          planId: input.planId,
          billingCycle: input.billingCycle,
          status: "pending_payment",
          startDate: new Date(),
          endDate,
          upgradeRequestedPlanId: input.planId,
          upgradeRequestedAt: new Date(),
          upgradeRequestedAddons: input.addons,
        } as any);
      }
      return { success: true };
    }),

  // ─── Admin ────────────────────────────────────────────────────────────────────

  adminListSubscriptions: adminProcedure
    .input(z.object({
      status: z.enum(["all", "active", "expired", "cancelled", "pending_payment"]).default("all"),
    }))
    .query(async ({ input }) => {
      const d = await getDbOrThrow();
      const subs = await d.select().from(providerSubscriptions).orderBy(desc(providerSubscriptions.createdAt));
      const filtered = input.status === "all" ? subs : subs.filter((s) => s.status === input.status);

      const plans = await d.select().from(subscriptionPlans);
      const planMap: Record<number, typeof plans[0]> = Object.fromEntries(plans.map((p) => [p.id, p]));

      const profiles = await d.select().from(providerProfiles);
      const profileMap: Record<number, typeof profiles[0]> = Object.fromEntries(profiles.map((p) => [p.id, p]));

      return filtered.map((s) => ({
        ...s,
        plan: planMap[s.planId] ?? null,
        provider: profileMap[s.providerId] ?? null,
      }));
    }),

  adminActivateSubscription: adminProcedure
    .input(z.object({
      subscriptionId: z.number(),
      planId: z.number(),
      billingCycle: z.enum(["trial", "monthly", "annual"]),
      durationDays: z.number().default(30),
      hasFeaturedListings: z.boolean().default(false),
      hasHeroAds: z.boolean().default(false),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const d = await getDbOrThrow();
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + input.durationDays);

      await d.update(providerSubscriptions).set({
        planId: input.planId,
        billingCycle: input.billingCycle,
        status: "active",
        startDate,
        endDate,
        hasFeaturedListings: input.hasFeaturedListings,
        featuredListingsExpiry: input.hasFeaturedListings ? endDate : null,
        hasHeroAds: input.hasHeroAds,
        heroAdsExpiry: input.hasHeroAds ? endDate : null,
        upgradeRequestedPlanId: null,
        upgradeRequestedAt: null,
        upgradeRequestedAddons: [],
        adminNotes: input.adminNotes ?? null,
        activatedBy: ctx.user.id,
      } as any).where(eq(providerSubscriptions.id, input.subscriptionId));

      return { success: true };
    }),

  adminCreateTrialSubscription: adminProcedure
    .input(z.object({
      providerId: z.number(),
      trialDays: z.number().default(14),
    }))
    .mutation(async ({ ctx, input }) => {
      const d = await getDbOrThrow();
      const plan = await d.select().from(subscriptionPlans).where(eq(subscriptionPlans.slug, "free_trial")).limit(1);
      if (!plan[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Free trial plan not found" });

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + input.trialDays);

      const existing = await d.select().from(providerSubscriptions).where(eq(providerSubscriptions.providerId, input.providerId)).limit(1);

      if (existing[0]) {
        await d.update(providerSubscriptions).set({
          planId: plan[0].id,
          billingCycle: "trial",
          status: "active",
          startDate: new Date(),
          endDate,
          activatedBy: ctx.user.id,
        } as any).where(eq(providerSubscriptions.id, existing[0].id));
      } else {
        await d.insert(providerSubscriptions).values({
          providerId: input.providerId,
          planId: plan[0].id,
          billingCycle: "trial",
          status: "active",
          startDate: new Date(),
          endDate,
          activatedBy: ctx.user.id,
        } as any);
      }
      return { success: true };
    }),

  adminUpdatePlan: adminProcedure
    .input(z.object({
      id: z.number(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      descriptionAr: z.string().optional(),
      descriptionEn: z.string().optional(),
      monthlyPriceSAR: z.number().optional(),
      annualPriceSAR: z.number().optional(),
      trialDays: z.number().optional(),
      maxPrograms: z.number().optional(),
      featuresAr: z.array(z.string()).optional(),
      featuresEn: z.array(z.string()).optional(),
      isFeaturedInListings: z.boolean().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const d = await getDbOrThrow();
      const { id, ...rest } = input;
      await d.update(subscriptionPlans).set(rest as any).where(eq(subscriptionPlans.id, id));
      return { success: true };
    }),

  adminUpdateAddon: adminProcedure
    .input(z.object({
      id: z.number(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      descriptionAr: z.string().optional(),
      descriptionEn: z.string().optional(),
      monthlyPriceSAR: z.number().optional(),
      maxSlots: z.number().optional(),
      totalPlatformSlots: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const d = await getDbOrThrow();
      const { id, ...rest } = input;
      await d.update(planAddons).set(rest as any).where(eq(planAddons.id, id));
      return { success: true };
    }),

  adminSubscriptionStats: adminProcedure.query(async () => {
    const d = await getDbOrThrow();
    const all = await d.select().from(providerSubscriptions);
    const now = new Date();
    return {
      total: all.length,
      active: all.filter((s) => s.status === "active" && new Date(s.endDate) > now).length,
      expired: all.filter((s) => s.status === "expired" || (s.status === "active" && new Date(s.endDate) <= now)).length,
      pendingPayment: all.filter((s) => s.status === "pending_payment").length,
      withFeatured: all.filter((s) => s.hasFeaturedListings).length,
      withHeroAds: all.filter((s) => s.hasHeroAds).length,
    };
  }),
});
