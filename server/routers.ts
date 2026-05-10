import { COOKIE_NAME, usdToSar, sarToUsd } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import { marketersRouter, suppliersRouter, salesCustomersRouter, salesOrdersRouter } from "./routers/salesRouter";
import { liteAPIHotelProcedures } from "./routers/liteotel-procedures";
import { siteSettingsRouter } from "./routers/siteSettingsRouter";
import { newsRouter } from "./routers/newsRouter";
import { profileRouter } from "./routers/profileRouter";
import { customAuthRouter } from "./routers/customAuthRouter";
import { subscriptionsRouter } from "./routers/subscriptionsRouter";
import { bookingReviewsRouter } from "./routers/bookingReviewsRouter";
import { providerNotificationsRouter } from "./routers/providerNotificationsRouter";
import { chatRouter } from "./routers/chatRouter";
import {
  users, waitlistEmails,
  hajjPrograms, umrahPrograms, hotels, flights,
  visaTypes, visaApplications, vehicles, tours,
  products, productCategories, orders, bookings, siteSettings,
  trainBookings, passportRecords, dynamicPricingRules,
  hajjCompanies, hajjCompanyReviews, hajjDomesticNotifications,
  hajjInternationalPackages, notificationSubscribers,
  hajjBookingRequests, umrahBookingRequests, flexibleRequests,
  providerProfiles, providerPrograms, providerBookings,
  providerApplications, roles, permissions,
  subscriptionPlans, providerSubscriptions,
  mediaPosts, InsertMediaPost,
  heroAds, searchFieldsConfig,
  salesOrders, marketers, suppliers,
  customerReviews,
  InsertHajjProgram, InsertUmrahProgram, InsertHotel, InsertFlight,
  InsertVehicle, InsertTour, InsertProduct,
  packageViews, wishlists,
  conversations, messages,
  coupons, couponUsages,
  userEvents,
  payments,
} from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { createPayment, createInvoice, getPayment, getInvoice, sarToHalala } from "./moyasar";
import { generateZatcaQR, calculateVat, generateInvoiceNumber } from "./zatca";
import { ENV } from "./_core/env";
import { createUnifiedPayment, verifyUnifiedPayment, getUnifiedPaymentStatus, type PaymentServiceType } from "./payment-unified";
import { encrypt, maskSensitive } from "./encryption";
import { eq, and, desc, asc, like, gte, lte, or, sql, isNotNull } from "drizzle-orm";
import { nanoid } from "nanoid";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});
// Provider guard middleware
const providerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "provider" && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Provider access required" });
  return next({ ctx });
});

// ─── Permission Guard Helper ────────────────────────────────────────────────
// Checks if a non-admin user has a specific permission on a section.
// Admins always pass. Users with custom permissions are checked against DB.
async function checkSectionPermission(
  userId: number,
  role: string,
  section: string,
  action: "canView" | "canCreate" | "canEdit" | "canDelete"
): Promise<boolean> {
  if (role === "admin") return true; // admins bypass all permission checks
  const db = await getDb();
  if (!db) return false;
  const perm = await db.select().from(permissions)
    .where(and(eq(permissions.userId, userId), eq(permissions.section, section)))
    .limit(1);
  if (!perm[0]) return false;
  return !!(perm[0] as any)[action];
}

// Factory: creates a protected procedure that enforces section-level permissions.
// Admins always pass. Other roles need explicit DB permission.
function sectionProcedure(section: string, action: "canView" | "canCreate" | "canEdit" | "canDelete") {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const allowed = await checkSectionPermission(ctx.user.id, ctx.user.role, section, action);
    if (!allowed) throw new TRPCError({ code: "FORBIDDEN", message: `ليس لديك صلاحية ${action} على قسم ${section}` });
    return next({ ctx });
  });
}

// ─── Analytics Router ───────────────────────────────────────────────────────
const analyticsRouter = router({
  // Real-time revenue dashboard
  revenue: adminProcedure.input(z.object({
    period: z.enum(["7d", "30d", "90d", "365d"]).default("30d"),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { total: 0, bookingRevenue: 0, orderRevenue: 0, daily: [], byService: [] };
    const days = input.period === "7d" ? 7 : input.period === "30d" ? 30 : input.period === "90d" ? 90 : 365;
    const since = new Date(Date.now() - days * 86400000);
    const [bookingRevRows, orderRevRows] = await Promise.all([
      db.select({ total: sql<number>`COALESCE(SUM(CAST(totalUSD AS DECIMAL(10,2))), 0)` })
        .from(bookings).where(and(gte(bookings.createdAt, since), eq(bookings.paymentStatus, "paid"))),
      db.select({ total: sql<number>`COALESCE(SUM(CAST(totalUSD AS DECIMAL(10,2))), 0)` })
        .from(orders).where(gte(orders.createdAt, since)),
    ]);
    const bookingRevenue = Number(bookingRevRows[0]?.total ?? 0);
    const orderRevenue = Number(orderRevRows[0]?.total ?? 0);
    // Daily breakdown for chart
    const dailyBookings = await db.select({
      date: sql<string>`DATE(createdAt)`,
      revenue: sql<number>`COALESCE(SUM(CAST(totalUSD AS DECIMAL(10,2))), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(bookings).where(gte(bookings.createdAt, since)).groupBy(sql`DATE(createdAt)`).orderBy(sql`DATE(createdAt)`);
    // By service type
    const byService = await db.select({
      serviceType: bookings.serviceType,
      revenue: sql<number>`COALESCE(SUM(CAST(totalUSD AS DECIMAL(10,2))), 0)`,
      count: sql<number>`COUNT(*)`,
    }).from(bookings).where(gte(bookings.createdAt, since)).groupBy(bookings.serviceType);
    return { total: bookingRevenue + orderRevenue, bookingRevenue, orderRevenue, daily: dailyBookings, byService };
  }),

  // Conversion rates per service
  conversion: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const stats = await db.select({
      serviceType: bookings.serviceType,
      total: sql<number>`COUNT(*)`,
      confirmed: sql<number>`SUM(CASE WHEN status IN ('confirmed','completed') THEN 1 ELSE 0 END)`,
      cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
    }).from(bookings).groupBy(bookings.serviceType);
    return stats.map(s => ({
      ...s,
      conversionRate: s.total > 0 ? Math.round((Number(s.confirmed) / Number(s.total)) * 100) : 0,
    }));
  }),

  // Seasonal demand forecast (monthly booking counts over last 12 months)
  seasonalForecast: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const since = new Date(Date.now() - 365 * 86400000);
    const monthly = await db.select({
      month: sql<string>`DATE_FORMAT(createdAt, '%Y-%m')`,
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(CAST(totalUSD AS DECIMAL(10,2))), 0)`,
    }).from(bookings).where(gte(bookings.createdAt, since)).groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`).orderBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`);
    return monthly;
  }),

  // User behavior stats
  userStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalUsers: 0, newThisMonth: 0, topServices: [], recentBookings: [] };
    const { users } = await import("../drizzle/schema");
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [totalUsersRows, newUsersRows, recentBookingsRows] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(users),
      db.select({ count: sql<number>`COUNT(*)` }).from(users).where(gte(users.createdAt, monthStart)),
      db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(5),
    ]);
    const topServices = await db.select({
      serviceType: bookings.serviceType,
      count: sql<number>`COUNT(*)`,
    }).from(bookings).groupBy(bookings.serviceType).orderBy(sql`COUNT(*) DESC`).limit(5);
     return {
      totalUsers: Number(totalUsersRows[0]?.count ?? 0),
      newThisMonth: Number(newUsersRows[0]?.count ?? 0),
      topServices,
      recentBookings: recentBookingsRows,
    };
  }),
  // ─── Visitor Tracking ─────────────────────────────────────────────────────
  // Record a page view (public, called from frontend on every route change)
  trackPageView: publicProcedure.input(z.object({
    sessionId: z.string().max(64),
    page: z.string().max(255),
    referrer: z.string().max(500).optional(),
    userAgent: z.string().max(500).optional(),
    device: z.enum(["desktop", "mobile", "tablet"]).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return { ok: true };
    const { pageViews } = await import("../drizzle/schema");
    // Get IP from request headers
    const req = (ctx as any).req;
    const ip = (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req?.headers?.["x-real-ip"]
      || req?.socket?.remoteAddress
      || "unknown";
    // GeoIP lookup using free ip-api.com
    let country = "غير محدد";
    let countryCode = "XX";
    let city = "";
    try {
      if (ip && ip !== "unknown" && ip !== "127.0.0.1" && !ip.startsWith("::1") && !ip.startsWith("10.") && !ip.startsWith("192.168.")) {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city&lang=ar`, { signal: AbortSignal.timeout(2000) });
        if (geoRes.ok) {
          const geo = await geoRes.json() as { country?: string; countryCode?: string; city?: string };
          if (geo.country) { country = geo.country; countryCode = geo.countryCode ?? "XX"; city = geo.city ?? ""; }
        }
      }
    } catch { /* GeoIP failed silently */ }
    await db.insert(pageViews).values({
      sessionId: input.sessionId,
      page: input.page,
      referrer: input.referrer ?? null,
      userAgent: input.userAgent ?? null,
      device: input.device ?? "desktop",
      ip,
      country,
      countryCode,
      city,
      userId: (ctx as any).user?.id ?? null,
      createdAt: Date.now(),
    });
    return { ok: true };
  }),
  // Get visitor overview for admin dashboard
  visitorOverview: adminProcedure.input(z.object({
    days: z.number().min(1).max(365).default(30),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { totalViews: 0, uniqueSessions: 0, topPages: [], byCountry: [], dailyViews: [] };
    const { pageViews } = await import("../drizzle/schema");
    const since = Date.now() - input.days * 86400000;
    const [totalViewsRows, uniqueSessionsRows, topPagesRows, byCountryRows, dailyViewsRows] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(pageViews).where(gte(pageViews.createdAt, since)),
      db.select({ count: sql<number>`COUNT(DISTINCT session_id)` }).from(pageViews).where(gte(pageViews.createdAt, since)),
      db.select({
        page: pageViews.page,
        views: sql<number>`COUNT(*)`,
      }).from(pageViews).where(gte(pageViews.createdAt, since)).groupBy(pageViews.page).orderBy(sql`COUNT(*) DESC`).limit(10),
      db.select({
        country: pageViews.country,
        countryCode: pageViews.countryCode,
        visits: sql<number>`COUNT(DISTINCT session_id)`,
      }).from(pageViews).where(gte(pageViews.createdAt, since)).groupBy(pageViews.country, pageViews.countryCode).orderBy(sql`COUNT(DISTINCT session_id) DESC`).limit(15),
      db.select({
        day: sql<string>`DATE(FROM_UNIXTIME(created_at / 1000))`,
        views: sql<number>`COUNT(*)`,
        unique: sql<number>`COUNT(DISTINCT session_id)`,
      }).from(pageViews).where(gte(pageViews.createdAt, since)).groupBy(sql`DATE(FROM_UNIXTIME(created_at / 1000))`).orderBy(sql`DATE(FROM_UNIXTIME(created_at / 1000))`),
    ]);
    return {
      totalViews: Number(totalViewsRows[0]?.count ?? 0),
      uniqueSessions: Number(uniqueSessionsRows[0]?.count ?? 0),
      topPages: topPagesRows.map(r => ({ page: r.page, views: Number(r.views) })),
      byCountry: byCountryRows.map(r => ({ country: r.country ?? "غير محدد", countryCode: r.countryCode ?? "XX", visits: Number(r.visits) })),
      dailyViews: dailyViewsRows.map(r => ({ day: r.day, views: Number(r.views), unique: Number(r.unique) })),
    };
  }),
  // Get real financial overview for admin dashboard
  financialOverview: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0, totalBookings: 0, confirmedBookings: 0, pendingBookings: 0, cancelledBookings: 0, totalOrders: 0, totalSalesRevenue: 0 };
    const [bookingStats, orderStats, salesStats] = await Promise.all([
      db.select({
        total: sql<number>`COUNT(*)`,
        confirmed: sql<number>`SUM(CASE WHEN status IN ('confirmed','completed') THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
        cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(totalUSD AS DECIMAL(12,2))), 0)`,
        paidRevenue: sql<number>`COALESCE(SUM(CASE WHEN paymentStatus = 'paid' THEN CAST(totalUSD AS DECIMAL(12,2)) ELSE 0 END), 0)`,
        pendingRevenue: sql<number>`COALESCE(SUM(CASE WHEN paymentStatus IN ('unpaid','partial') THEN CAST(totalUSD AS DECIMAL(12,2)) ELSE 0 END), 0)`,
      }).from(bookings),
      db.select({
        total: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(totalUSD AS DECIMAL(12,2))), 0)`,
      }).from(orders),
      db.select({
        totalRevenue: sql<number>`COALESCE(SUM(CAST(selling_price AS DECIMAL(12,2))), 0)`,
      }).from(salesOrders).where(eq(salesOrders.status, "completed")),
    ]);
    const b = bookingStats[0];
    const o = orderStats[0];
    const s = salesStats[0];
    return {
      totalRevenue: Number(b?.totalRevenue ?? 0) + Number(o?.totalRevenue ?? 0),
      paidRevenue: Number(b?.paidRevenue ?? 0),
      pendingRevenue: Number(b?.pendingRevenue ?? 0),
      totalBookings: Number(b?.total ?? 0),
      confirmedBookings: Number(b?.confirmed ?? 0),
      pendingBookings: Number(b?.pending ?? 0),
      cancelledBookings: Number(b?.cancelled ?? 0),
      totalOrders: Number(o?.total ?? 0),
      totalSalesRevenue: Number(s?.totalRevenue ?? 0),
    };
  }),
  // Get real product counts for admin dashboard
  productOverview: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { hajj: 0, umrah: 0, hotels: 0, flights: 0, tours: 0, vehicles: 0, visaTypes: 0, products: 0, totalSuppliers: 0, approvedSuppliers: 0, totalMarketers: 0, activeMarketers: 0, waitlistCount: 0 };
    const { hajjPrograms: hp, umrahPrograms: up, hotels: ht, flights: fl, tours: tr, vehicles: vh, visaTypes: vt, products: pr, suppliers, marketers, waitlistEmails } = await import("../drizzle/schema");
    const results = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(hp),
      db.select({ count: sql<number>`COUNT(*)` }).from(up),
      db.select({ count: sql<number>`COUNT(*)` }).from(ht),
      db.select({ count: sql<number>`COUNT(*)` }).from(fl),
      db.select({ count: sql<number>`COUNT(*)` }).from(tr),
      db.select({ count: sql<number>`COUNT(*)` }).from(vh),
      db.select({ count: sql<number>`COUNT(*)` }).from(vt),
      db.select({ count: sql<number>`COUNT(*)` }).from(pr),
      db.select({ count: sql<number>`COUNT(*)` }).from(suppliers),
      db.select({ count: sql<number>`COUNT(*)` }).from(suppliers).where(eq(suppliers.approvalStatus, "approved")),
      db.select({ count: sql<number>`COUNT(*)` }).from(marketers),
      db.select({ count: sql<number>`COUNT(*)` }).from(marketers).where(eq(marketers.approvalStatus, "approved")),
      db.select({ count: sql<number>`COUNT(*)` }).from(waitlistEmails),
    ]);
    return {
      hajj: Number(results[0][0]?.count ?? 0),
      umrah: Number(results[1][0]?.count ?? 0),
      hotels: Number(results[2][0]?.count ?? 0),
      flights: Number(results[3][0]?.count ?? 0),
      tours: Number(results[4][0]?.count ?? 0),
      vehicles: Number(results[5][0]?.count ?? 0),
      visaTypes: Number(results[6][0]?.count ?? 0),
      products: Number(results[7][0]?.count ?? 0),
      totalSuppliers: Number(results[8][0]?.count ?? 0),
      approvedSuppliers: Number(results[9][0]?.count ?? 0),
      totalMarketers: Number(results[10][0]?.count ?? 0),
      activeMarketers: Number(results[11][0]?.count ?? 0),
      waitlistCount: Number(results[12][0]?.count ?? 0),
    };
  }),
  // Conversion funnel: view → start_booking → complete_booking
  conversionFunnel: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const stages = await db.select({
      eventType: userEvents.eventType,
      count: sql<number>`COUNT(DISTINCT userId)`,
    }).from(userEvents)
      .where(sql`eventType IN ('view_package','start_booking','complete_booking')`)
      .groupBy(userEvents.eventType);
    const map = Object.fromEntries(stages.map(s => [s.eventType, Number(s.count)]));
    return [
      { stage: 'مشاهدة الباقة', count: map['view_package'] ?? 0 },
      { stage: 'بدء الحجز', count: map['start_booking'] ?? 0 },
      { stage: 'إتمام الحجز', count: map['complete_booking'] ?? 0 },
    ];
  }),
  // Top providers by confirmed bookings (via providerBookings table)
  topProviders: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select({
      providerId: providerBookings.providerId,
      companyName: providerProfiles.companyName,
      bookingCount: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(CAST(${providerBookings.totalUSD} AS DECIMAL(10,2))), 0)`,
    }).from(providerBookings)
      .leftJoin(providerProfiles, eq(providerBookings.providerId, providerProfiles.userId))
      .where(eq(providerBookings.status, 'confirmed'))
      .groupBy(providerBookings.providerId, providerProfiles.companyName)
      .orderBy(desc(sql`COUNT(*)`)).limit(10);
    return rows;
  }),
});
// ─── Asset Manager Router ─────────────────────────────────────────────────────
const assetRouter = router({
  // Upload image/video to S3 and return CDN URL
  upload: adminProcedure.input(z.object({
    filename: z.string(),
    contentType: z.string(),
    base64Data: z.string(), // base64 encoded file data
    folder: z.enum(["hajj", "umrah", "hotels", "tours", "transport", "visa", "store", "general"]).default("general"),
  })).mutation(async ({ input }) => {
    const { storagePut } = await import("./storage");
    const { nanoid } = await import("nanoid");
    const buffer = Buffer.from(input.base64Data, "base64");
    const ext = input.filename.split(".").pop() ?? "jpg";
    const key = `${input.folder}/${nanoid(12)}.${ext}`;
    const { url } = await storagePut(key, buffer, input.contentType);
    return { url, key, filename: input.filename, contentType: input.contentType, size: buffer.length };
  }),

  // List assets by folder
  list: adminProcedure.input(z.object({
    folder: z.enum(["hajj", "umrah", "hotels", "tours", "transport", "visa", "store", "general"]).optional(),
  })).query(async () => {
    // Return empty list — assets are tracked via program imageUrl fields
    return { assets: [] as { url: string; key: string; filename: string; size: number; folder: string }[] };
  }),
});

// ─── Data Portability Router ──────────────────────────────────────────────────
const dataRouter = router({
  // Export bookings as JSON (frontend converts to CSV/XLSX)
  exportBookings: adminProcedure.input(z.object({
    status: z.enum(["all", "pending", "confirmed", "cancelled", "completed"]).default("all"),
    limit: z.number().min(1).max(10000).default(1000),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = input.status !== "all" ? [eq(bookings.status, input.status as "pending" | "confirmed" | "cancelled" | "completed" | "refunded")] : [];
    return db.select().from(bookings).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(bookings.createdAt)).limit(input.limit);
  }),

  // Export orders as JSON
  exportOrders: adminProcedure.input(z.object({
    limit: z.number().min(1).max(10000).default(1000),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(input.limit);
  }),

  // Export users as JSON
  exportUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const { users } = await import("../drizzle/schema");
    return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt));
  }),
  // List all users with pagination and search
  listUsers: adminProcedure.input(z.object({
    limit: z.number().min(1).max(500).default(100),
    offset: z.number().default(0),
    search: z.string().optional(),
    role: z.enum(["all", "user", "admin"]).default("all"),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { rows: [], total: 0 };
    const { users } = await import("../drizzle/schema");
    const conditions: any[] = [];
    if (input.role !== "all") conditions.push(eq(users.role, input.role as any));
    if (input.search) conditions.push(like(users.name, `%${input.search}%`));
    const whereClause = conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions);
    const [rows, [countRow]] = await Promise.all([
      db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn })
        .from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(input.limit).offset(input.offset),
      db.select({ count: sql<number>`COUNT(*)` }).from(users).where(whereClause),
    ]);
    return { rows, total: Number(countRow?.count ?? 0) };
  }),
  // Update user role
  updateUserRole: adminProcedure.input(z.object({
    userId: z.number(),
    role: z.enum(["user", "admin"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { users } = await import("../drizzle/schema");
    await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
    return { success: true };
  }),
  // Delete a user account
  deleteUser: adminProcedure.input(z.object({ userId: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { users } = await import("../drizzle/schema");
    await db.delete(users).where(eq(users.id, input.userId));
    return { success: true };
  }),
});

// ─── Dynamic Pricing Router ───────────────────────────────────────────────────
const pricingRouter = router({
  // Get all pricing rules
  listRules: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(siteSettings).where(like(siteSettings.key, "pricing_rule_%")).orderBy(asc(siteSettings.key));
  }),

  // Create/update a pricing rule
  upsertRule: adminProcedure.input(z.object({
    ruleId: z.string(), // e.g. "ramadan_2025", "group_10plus", "earlybird_90d"
    name: z.string(),
    type: z.enum(["seasonal", "group", "earlybird", "currency"]),
    discountPercent: z.number().min(0).max(100),
    conditions: z.record(z.string(), z.unknown()),
    isActive: z.boolean().default(true),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const key = `pricing_rule_${input.ruleId}`;
    const value = JSON.stringify({ name: input.name, type: input.type, discountPercent: input.discountPercent, conditions: input.conditions, isActive: input.isActive });
    await db.insert(siteSettings).values({ key, value, category: "pricing" }).onDuplicateKeyUpdate({ set: { value } });
    return { success: true };
  }),

  // Delete a pricing rule
  deleteRule: adminProcedure.input(z.object({ ruleId: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(siteSettings).where(eq(siteSettings.key, `pricing_rule_${input.ruleId}`));
    return { success: true };
  }),

  // Get active pricing rules (public — for frontend price calculation)
  getActiveRules: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(siteSettings).where(like(siteSettings.key, "pricing_rule_%"));
    return rows
      .map(r => { try { return JSON.parse(r.value ?? "{}"); } catch { return null; } })
      .filter(r => r && r.isActive);
  }),
});

// ─── Reviews & Reputation Router ─────────────────────────────────────────────
const reviewsRouter = router({
  // List approved reviews (public)
  list: publicProcedure.input(z.object({
    serviceType: z.string().optional(),
    limit: z.number().min(1).max(50).default(12),
    featured: z.boolean().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(siteSettings).where(like(siteSettings.key, "review_%")).orderBy(desc(siteSettings.key)).limit(input.limit * 3);
    const reviews = rows
      .map(r => { try { return { id: r.key, ...JSON.parse(r.value ?? "{}") }; } catch { return null; } })
      .filter(r => r && r.status === "approved" && (!input.serviceType || r.serviceType === input.serviceType) && (!input.featured || r.featured));
    return reviews.slice(0, input.limit);
  }),

  // Admin: list all reviews (pending + approved)
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(siteSettings).where(like(siteSettings.key, "review_%")).orderBy(desc(siteSettings.key));
    return rows.map(r => { try { return { id: r.key, ...JSON.parse(r.value ?? "{}") }; } catch { return null; } }).filter(Boolean);
  }),

  // Submit a review (public)
  submit: publicProcedure.input(z.object({
    reviewerName: z.string().min(2),
    reviewerCountry: z.string().optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10),
    serviceType: z.string().optional(),
    videoUrl: z.string().url().optional(),
    isVerified: z.boolean().default(false),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { nanoid } = await import("nanoid");
    const key = `review_${nanoid(12)}`;
    const value = JSON.stringify({ ...input, status: "pending", featured: false, createdAt: new Date().toISOString() });
    await db.insert(siteSettings).values({ key, value, category: "reviews" });
    return { success: true };
  }),

  // Admin: approve/reject/feature a review
  moderate: adminProcedure.input(z.object({
    reviewId: z.string(),
    status: z.enum(["approved", "rejected"]),
    featured: z.boolean().default(false),
    isVerified: z.boolean().default(false),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, input.reviewId));
    if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
    const existing = JSON.parse(rows[0].value ?? "{}");
    const updated = JSON.stringify({ ...existing, status: input.status, featured: input.featured, isVerified: input.isVerified });
    await db.update(siteSettings).set({ value: updated }).where(eq(siteSettings.key, input.reviewId));
    return { success: true };
  }),

  // Admin: delete a review
  delete: adminProcedure.input(z.object({ reviewId: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(siteSettings).where(eq(siteSettings.key, input.reviewId));
    return { success: true };
  }),
  // Admin: manually create a review (bypasses pending status)
  adminCreate: adminProcedure.input(z.object({
    reviewerName: z.string().min(1),
    reviewerCountry: z.string().optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1),
    serviceType: z.string().optional(),
    videoUrl: z.string().optional(),
    isVerified: z.boolean().default(true),
    featured: z.boolean().default(false),
    status: z.enum(["pending", "approved"]).default("approved"),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { nanoid } = await import("nanoid");
    const key = `review_${nanoid(12)}`;
    const value = JSON.stringify({ ...input, createdAt: new Date().toISOString() });
    await db.insert(siteSettings).values({ key, value, category: "reviews" });
    return { success: true };
  }),
  // Admin: bulk import reviews from JSON array
  bulkImport: adminProcedure.input(z.object({
    reviews: z.array(z.object({
      reviewerName: z.string().min(1),
      reviewerCountry: z.string().optional(),
      rating: z.number().min(1).max(5),
      comment: z.string().min(1),
      serviceType: z.string().optional(),
      isVerified: z.boolean().optional(),
      featured: z.boolean().optional(),
    })),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { nanoid } = await import("nanoid");
    const rows = input.reviews.map(r => ({
      key: `review_${nanoid(12)}`,
      value: JSON.stringify({ ...r, status: "approved", isVerified: r.isVerified ?? true, featured: r.featured ?? false, createdAt: new Date().toISOString() }),
      category: "reviews" as const,
    }));
    if (rows.length > 0) await db.insert(siteSettings).values(rows);
    return { success: true, count: rows.length };
  }),
  // Public: get real Zid reviews from customer_reviews table
  getZidReviews: publicProcedure.input(z.object({
    limit: z.number().min(1).max(500).default(9),
    minRating: z.number().min(1).max(5).default(4),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const reviews = await db.select({
      id: customerReviews.id,
      reviewerName: customerReviews.reviewerName,
      rating: customerReviews.rating,
      reviewText: customerReviews.reviewText,
      productName: customerReviews.productName,
      createdAt: customerReviews.createdAt,
    }).from(customerReviews)
      .where(and(
        eq(customerReviews.status, "approved"),
        gte(customerReviews.rating, input.minRating),
        isNotNull(customerReviews.reviewText),
      ))
      .orderBy(desc(customerReviews.rating), desc(customerReviews.createdAt))
      .limit(input.limit);
    return reviews;
  }),
  // Admin: list all platform reviews with pagination
  listPlatformReviews: adminProcedure.input(z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(20),
    status: z.enum(["approved", "pending", "hidden", "all"]).default("all"),
    search: z.string().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { reviews: [], total: 0 };
    const offset = (input.page - 1) * input.limit;
    const conditions: any[] = [];
    if (input.status !== "all") conditions.push(eq(customerReviews.status, input.status as any));
    if (input.search) conditions.push(like(customerReviews.reviewerName, `%${input.search}%`));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [reviews, countRows] = await Promise.all([
      db.select().from(customerReviews).where(where).orderBy(desc(customerReviews.createdAt)).limit(input.limit).offset(offset),
      db.select({ total: sql<number>`count(*)` }).from(customerReviews).where(where),
    ]);
    return { reviews, total: Number(countRows[0].total) };
  }),
  // Admin: update review status
  updatePlatformReview: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["approved", "pending", "hidden"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(customerReviews).set({ status: input.status }).where(eq(customerReviews.id, input.id));
    return { success: true };
  }),
  // Admin: delete a platform review
  deletePlatformReview: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(customerReviews).where(eq(customerReviews.id, input.id));
    return { success: true };
  }),
  // Public: get review stats
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, average: 0, distribution: {} };
    const [stats, dist] = await Promise.all([
      db.select({ total: sql<number>`count(*)`, average: sql<number>`ROUND(AVG(rating), 1)` }).from(customerReviews).where(eq(customerReviews.status, "approved")),
      db.select({ rating: customerReviews.rating, count: sql<number>`count(*)` }).from(customerReviews).where(eq(customerReviews.status, "approved")).groupBy(customerReviews.rating),
    ]);
    const distribution: Record<number, number> = {};
    dist.forEach(d => { distribution[d.rating] = Number(d.count); });
    return { total: Number(stats[0].total), average: Number(stats[0].average), distribution };
  }),
});
// ─── SEO Router ────────────────────────────────────────────────────────────────
const seoRouter = router({
  // Get SEO settings for a page
  get: publicProcedure.input(z.object({ page: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, `seo_${input.page}`));
    if (!rows[0]) return null;
    try { return JSON.parse(rows[0].value ?? "{}"); } catch { return null; }
  }),

  // Admin: update SEO settings for a page
  update: adminProcedure.input(z.object({
    page: z.string(),
    title: z.string(),
    description: z.string(),
    keywords: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
    ogImage: z.string().optional(),
    structuredData: z.string().optional(), // JSON-LD string
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { page, ...seoData } = input;
    await db.insert(siteSettings).values({ key: `seo_${page}`, value: JSON.stringify(seoData), category: "seo" }).onDuplicateKeyUpdate({ set: { value: JSON.stringify(seoData) } });
    return { success: true };
  }),

  // Get all SEO pages
  listPages: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(siteSettings).where(like(siteSettings.key, "seo_%"));
    return rows.map(r => ({ page: r.key?.replace("seo_", ""), ...JSON.parse(r.value ?? "{}") }));
  }),
});

// ─── Hajj Vertical Router ─────────────────────────────────────────────────────
const hajjVerticalRouter = router({
  // Local Hajj news/alerts (read-only, information portal)
  localNews: publicProcedure.input(z.object({
    limit: z.number().min(1).max(20).default(6),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(siteSettings).where(like(siteSettings.key, "hajj_news_%")).orderBy(desc(siteSettings.key)).limit(input.limit);
    return rows.map(r => { try { return { id: r.key, ...JSON.parse(r.value ?? "{}") }; } catch { return null; } }).filter(Boolean);
  }),

  // Admin: add local Hajj news
  addNews: adminProcedure.input(z.object({
    title: z.string(),
    titleAr: z.string().optional(),
    content: z.string(),
    contentAr: z.string().optional(),
    category: z.enum(["alert", "news", "update", "announcement"]).default("news"),
    isUrgent: z.boolean().default(false),
    source: z.string().optional(),
    imageUrl: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { nanoid } = await import("nanoid");
    const key = `hajj_news_${Date.now()}_${nanoid(6)}`;
    await db.insert(siteSettings).values({ key, value: JSON.stringify({ ...input, publishedAt: new Date().toISOString() }), category: "hajj_news" });
    return { success: true };
  }),

  // Delete news item
  deleteNews: adminProcedure.input(z.object({ newsId: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(siteSettings).where(eq(siteSettings.key, input.newsId));
    return { success: true };
  }),

  // Domestic Umrah routes (Saudi city-to-city)
  domesticRoutes: publicProcedure.query(async () => {
    return [
      { id: 1, from: "الرياض", fromEn: "Riyadh", to: "مكة المكرمة", toEn: "Makkah", trainAvailable: true, duration: "4h 30m", priceUSD: 45, trainPrice: 35, busPrice: 20 },
      { id: 2, from: "جدة", fromEn: "Jeddah", to: "مكة المكرمة", toEn: "Makkah", trainAvailable: false, duration: "1h 15m", priceUSD: 15, trainPrice: null, busPrice: 10 },
      { id: 3, from: "مكة المكرمة", fromEn: "Makkah", to: "المدينة المنورة", toEn: "Madinah", trainAvailable: true, duration: "2h 15m", priceUSD: 55, trainPrice: 45, busPrice: 25 },
      { id: 4, from: "الدمام", fromEn: "Dammam", to: "مكة المكرمة", toEn: "Makkah", trainAvailable: false, duration: "8h", priceUSD: 65, trainPrice: null, busPrice: 40 },
      { id: 5, from: "المدينة المنورة", fromEn: "Madinah", to: "مكة المكرمة", toEn: "Makkah", trainAvailable: true, duration: "2h 15m", priceUSD: 55, trainPrice: 45, busPrice: 25 },
      { id: 6, from: "الطائف", fromEn: "Taif", to: "مكة المكرمة", toEn: "Makkah", trainAvailable: false, duration: "1h 30m", priceUSD: 20, trainPrice: null, busPrice: 12 },
    ];
  }),
});

// Admin guard middleware
// ─── Hajj Router ─────────────────────────────────────────────────────────────
const hajjRouter = router({
  list: publicProcedure.input(z.object({
    portal: z.enum(["internal", "external", "both", "all"]).optional().default("all"),
    featured: z.boolean().optional(),
    includeInactive: z.boolean().optional().default(false),
    limit: z.number().min(1).max(100).optional().default(20),
    offset: z.number().optional().default(0),
    search: z.string().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions: any[] = [];
    if (!input.includeInactive) conditions.push(eq(hajjPrograms.isActive, true));
    if (input.portal !== "all") conditions.push(or(eq(hajjPrograms.portalType, input.portal as any), eq(hajjPrograms.portalType, "both"))!);
    if (input.featured) conditions.push(eq(hajjPrograms.isFeatured, true));
    if (input.search) conditions.push(like(hajjPrograms.title, `%${input.search}%`));
    const whereClause = conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions as [any, ...any[]]);
    return db.select().from(hajjPrograms).where(whereClause).orderBy(asc(hajjPrograms.sortOrder), desc(hajjPrograms.createdAt)).limit(input.limit).offset(input.offset);
  }),

  toggleActive: adminProcedure.input(z.object({
    id: z.number(),
    isActive: z.boolean(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(hajjPrograms).set({ isActive: input.isActive }).where(eq(hajjPrograms.id, input.id));
    return { success: true };
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(hajjPrograms).where(eq(hajjPrograms.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure.input(z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    portalType: z.enum(["internal", "external", "both"]).default("both"),
    category: z.string().default("standard"),
    nusukPackageType: z.string().optional().default("standard"),
    imageUrl: z.string().optional(),
    priceUSD: z.string(),
    priceSAR: z.string().optional(),
    priceFromSAR: z.string().optional(),
    priceToSAR: z.string().optional(),
    originalPriceUSD: z.string().optional(),
    duration: z.number().default(14),
    departureCity: z.string().optional(),
    seatsTotal: z.number().optional(),
    seatsAvailable: z.number().optional(),
    hotelMakkah: z.string().optional(),
    hotelMadinah: z.string().optional(),
    hotelStarRating: z.number().optional(),
    features: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
    isUrgent: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    badge: z.string().optional(),
    sortOrder: z.number().optional(),
    description: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(hajjPrograms).values(input as InsertHajjProgram);
    return { success: true };
  }),

  update: adminProcedure.input(z.object({
    id: z.number(),
    data: z.record(z.string(), z.any()),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(hajjPrograms).set(input.data as any).where(eq(hajjPrograms.id, input.id));
    return { success: true };
  }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(hajjPrograms).where(eq(hajjPrograms.id, input.id));
    return { success: true };
  }),
});

// ─── Umrah Router ─────────────────────────────────────────────────────────────
const umrahRouter = router({
  list: publicProcedure.input(z.object({
    portal: z.enum(["internal", "external", "both", "all"]).optional().default("all"),
    featured: z.boolean().optional(),
    limit: z.number().min(1).max(100).optional().default(20),
    offset: z.number().optional().default(0),
    search: z.string().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(umrahPrograms.isActive, true)];
    if (input.portal !== "all") conditions.push(or(eq(umrahPrograms.portalType, input.portal as any), eq(umrahPrograms.portalType, "both"))!);
    if (input.featured) conditions.push(eq(umrahPrograms.isFeatured, true));
    if (input.search) conditions.push(like(umrahPrograms.title, `%${input.search}%`));
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions as [any, ...any[]]);
    return db.select().from(umrahPrograms).where(whereClause).orderBy(asc(umrahPrograms.sortOrder), desc(umrahPrograms.createdAt)).limit(input.limit).offset(input.offset);
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(umrahPrograms).where(eq(umrahPrograms.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure.input(z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    portalType: z.enum(["internal", "external", "both"]).default("both"),
    category: z.string().default("standard"),
    imageUrl: z.string().optional(),
    priceUSD: z.string(),
    originalPriceUSD: z.string().optional(),
    duration: z.number().default(10),
    departureCity: z.string().optional(),
    seatsTotal: z.number().optional(),
    seatsAvailable: z.number().optional(),
    hotelMakkah: z.string().optional(),
    hotelMadinah: z.string().optional(),
    hotelStarRating: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    isUrgent: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    badge: z.string().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(umrahPrograms).values(input as InsertUmrahProgram);
    return { success: true };
  }),

  update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(umrahPrograms).set(input.data as any).where(eq(umrahPrograms.id, input.id));
    return { success: true };
  }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(umrahPrograms).where(eq(umrahPrograms.id, input.id));
    return { success: true };
  }),
});

// ─── Hotels Router ────────────────────────────────────────────────────────────
const hotelsRouter = router({
  list: publicProcedure.input(z.object({
    city: z.enum(["makkah", "madinah", "jeddah", "other", "all"]).optional().default("all"),
    minStars: z.number().optional(),
    maxPrice: z.number().optional(),
    featured: z.boolean().optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
    search: z.string().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(hotels.isActive, true)];
    if (input.city !== "all") conditions.push(eq(hotels.city, input.city as any));
    if (input.featured) conditions.push(eq(hotels.isFeatured, true));
    if (input.minStars) conditions.push(gte(hotels.starRating, input.minStars));
    if (input.search) conditions.push(like(hotels.name, `%${input.search}%`));
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions as [any, ...any[]]);
    return db.select().from(hotels).where(whereClause).orderBy(asc(hotels.sortOrder), desc(hotels.createdAt)).limit(input.limit).offset(input.offset);
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(hotels).where(eq(hotels.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure.input(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    city: z.enum(["makkah", "madinah", "jeddah", "other"]).default("makkah"),
    address: z.string().optional(),
    distanceToHaram: z.string().optional(),
    starRating: z.number().optional(),
    imageUrl: z.string().optional(),
    pricePerNightUSD: z.string(),
    amenities: z.array(z.string()).optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(hotels).values(input as InsertHotel);
    return { success: true };
  }),

  update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(hotels).set(input.data as any).where(eq(hotels.id, input.id));
    return { success: true };
  }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(hotels).where(eq(hotels.id, input.id));
    return { success: true };
  }),

  ...liteAPIHotelProcedures,
});

// ─── Flights Router ───────────────────────────────────────────────────────────
const flightsRouter = router({
  list: publicProcedure.input(z.object({
    origin: z.string().optional(),
    destination: z.string().optional(),
    cabinClass: z.enum(["economy", "business", "first", "all"]).optional().default("all"),
    featured: z.boolean().optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(flights.isActive, true)];
    if (input.origin) conditions.push(like(flights.origin, `%${input.origin}%`));
    if (input.destination) conditions.push(like(flights.destination, `%${input.destination}%`));
    if (input.cabinClass !== "all") conditions.push(eq(flights.cabinClass, input.cabinClass as any));
    if (input.featured) conditions.push(eq(flights.isFeatured, true));
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions as [any, ...any[]]);
    return db.select().from(flights).where(whereClause).orderBy(asc(flights.priceUSD)).limit(input.limit).offset(input.offset);
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(flights).where(eq(flights.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure.input(z.object({
    airline: z.string().min(1),
    airlineCode: z.string().optional(),
    flightNumber: z.string().min(1),
    origin: z.string().min(1),
    originCity: z.string().optional(),
    destination: z.string().min(1),
    destinationCity: z.string().optional(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    duration: z.number(),
    stops: z.number().optional(),
    cabinClass: z.enum(["economy", "business", "first"]).default("economy"),
    priceUSD: z.string(),
    seatsAvailable: z.number().optional(),
    baggage: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(flights).values({
      ...input,
      departureTime: new Date(input.departureTime),
      arrivalTime: new Date(input.arrivalTime),
    } as InsertFlight);
    return { success: true };
  }),

  update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(flights).set(input.data as any).where(eq(flights.id, input.id));
    return { success: true };
  }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(flights).where(eq(flights.id, input.id));
    return { success: true };
  }),
});

// ─── Visa Router ──────────────────────────────────────────────────────────────
const visaRouter = router({
  listTypes: publicProcedure.input(z.object({
    type: z.enum(["umrah", "hajj", "tourist", "transit", "business", "family", "all"]).optional().default("all"),
    featured: z.boolean().optional(),
  }).optional()).query(async ({ input }) => {
    const safeInput = input ?? { type: "all" as const, featured: undefined };
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(visaTypes.isActive, true)];
    if (safeInput.type !== "all") conditions.push(eq(visaTypes.type, safeInput.type as any));
    if (safeInput.featured) conditions.push(eq(visaTypes.isFeatured, true));
    return db.select().from(visaTypes).where(and(...conditions)).orderBy(asc(visaTypes.sortOrder));
  }),

  getTypeById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(visaTypes).where(eq(visaTypes.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  submitApplication: publicProcedure.input(z.object({
    visaTypeId: z.number(),
    visaTypeName: z.string().optional(),
    applicantName: z.string().min(1),
    passportNumber: z.string().min(1),
    nationality: z.string().min(1),
    dateOfBirth: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    travelDate: z.string().optional(),
    notes: z.string().optional(),
    feeSAR: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [result] = await db.insert(visaApplications).values({
      ...input,
      userId: ctx.user?.id,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      feeSAR: input.feeSAR ? String(input.feeSAR) : undefined,
    } as any);
    return { success: true, applicationId: (result as any).insertId as number };
  }),

  listApplications: adminProcedure.input(z.object({
    status: z.enum(["pending", "processing", "approved", "rejected", "cancelled", "all"]).optional().default("all"),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = input.status !== "all" ? [eq(visaApplications.status, input.status as any)] : [];
    if (conditions.length === 0) return db.select().from(visaApplications).orderBy(desc(visaApplications.createdAt)).limit(input.limit).offset(input.offset);
    return db.select().from(visaApplications).where(conditions[0]).orderBy(desc(visaApplications.createdAt)).limit(input.limit).offset(input.offset);
  }),

  updateApplicationStatus: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "processing", "approved", "rejected", "cancelled"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(visaApplications).set({ status: input.status, processedAt: new Date() }).where(eq(visaApplications.id, input.id));
    return { success: true };
  }),

  createType: adminProcedure.input(z.object({
    name: z.string().min(1),
    type: z.enum(["umrah", "hajj", "tourist", "transit", "business", "family"]),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    priceUSD: z.string(),
    processingDays: z.number().optional(),
    validityDays: z.number().optional(),
    requirements: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(visaTypes).values(input as any);
    return { success: true };
  }),

  updateType: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(visaTypes).set(input.data as any).where(eq(visaTypes.id, input.id));
    return { success: true };
  }),

  deleteType: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(visaTypes).where(eq(visaTypes.id, input.id));
    return { success: true };
  }),
});

// ─── Transport Router ─────────────────────────────────────────────────────────
const transportRouter = router({
  list: publicProcedure.input(z.object({
    type: z.enum(["vip_car", "sedan", "suv", "van", "minibus", "bus", "all"]).optional().default("all"),
    minCapacity: z.number().optional(),
    featured: z.boolean().optional(),
    limit: z.number().optional().default(20),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(vehicles.isAvailable, true)];
    if (input.type !== "all") conditions.push(eq(vehicles.type, input.type as any));
    if (input.featured) conditions.push(eq(vehicles.isFeatured, true));
    if (input.minCapacity) conditions.push(gte(vehicles.capacity, input.minCapacity));
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions as [any, ...any[]]);
    return db.select().from(vehicles).where(whereClause).orderBy(asc(vehicles.sortOrder), asc(vehicles.pricePerTripUSD)).limit(input.limit);
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(vehicles).where(eq(vehicles.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure.input(z.object({
    name: z.string().min(1),
    type: z.enum(["vip_car", "sedan", "suv", "van", "minibus", "bus"]),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    capacity: z.number(),
    pricePerTripUSD: z.string(),
    pricePerDayUSD: z.string().optional(),
    features: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(vehicles).values(input as InsertVehicle);
    return { success: true };
  }),

  update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(vehicles).set(input.data as any).where(eq(vehicles.id, input.id));
    return { success: true };
  }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(vehicles).where(eq(vehicles.id, input.id));
    return { success: true };
  }),
});

// ─── Tours Router ─────────────────────────────────────────────────────────────
const toursRouter = router({
  list: publicProcedure.input(z.object({
    location: z.enum(["makkah", "madinah", "taif", "jeddah", "other", "all"]).optional().default("all"),
    category: z.enum(["religious", "cultural", "historical", "combined", "all"]).optional().default("all"),
    featured: z.boolean().optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
    search: z.string().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(tours.isActive, true)];
    if (input.location !== "all") conditions.push(eq(tours.location, input.location as any));
    if (input.category !== "all") conditions.push(eq(tours.category, input.category as any));
    if (input.featured) conditions.push(eq(tours.isFeatured, true));
    if (input.search) conditions.push(like(tours.title, `%${input.search}%`));
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions as [any, ...any[]]);
    return db.select().from(tours).where(whereClause).orderBy(asc(tours.sortOrder), desc(tours.createdAt)).limit(input.limit).offset(input.offset);
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(tours).where(eq(tours.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  create: adminProcedure.input(z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    location: z.enum(["makkah", "madinah", "taif", "jeddah", "other"]).default("makkah"),
    category: z.enum(["religious", "cultural", "historical", "combined"]).default("religious"),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    priceUSD: z.string(),
    duration: z.number().default(4),
    durationUnit: z.enum(["hours", "days"]).default("hours"),
    maxGroupSize: z.number().optional(),
    guideName: z.string().optional(),
    includes: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(tours).values(input as InsertTour);
    return { success: true };
  }),

  update: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(tours).set(input.data as any).where(eq(tours.id, input.id));
    return { success: true };
  }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(tours).where(eq(tours.id, input.id));
    return { success: true };
  }),
});

// ─── Wishlist Router ────────────────────────────────────────────────────────
const wishlistRouter = router({
  toggle: protectedProcedure.input(z.object({
    serviceType: z.enum(["hajj","umrah","hotel","flight","tour"]),
    serviceId: z.number(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const existing = await db.select().from(wishlists)
      .where(and(
        eq(wishlists.userId, ctx.user.id),
        eq(wishlists.serviceType, input.serviceType),
        eq(wishlists.serviceId, input.serviceId),
      )).limit(1);
    if (existing[0]) {
      await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
      return { saved: false };
    }
    await db.insert(wishlists).values({ userId: ctx.user.id, ...input });
    return { saved: true };
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(wishlists).where(eq(wishlists.userId, ctx.user.id))
      .orderBy(desc(wishlists.createdAt));
  }),
  check: protectedProcedure.input(z.object({
    serviceType: z.enum(["hajj","umrah","hotel","flight","tour"]),
    serviceId: z.number(),
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return false;
    const [r] = await db.select({ id: wishlists.id }).from(wishlists)
      .where(and(
        eq(wishlists.userId, ctx.user.id),
        eq(wishlists.serviceType, input.serviceType),
        eq(wishlists.serviceId, input.serviceId),
      )).limit(1);
    return !!r;
  }),
});

// ─── Track View ───────────────────────────────────────────────────────────────
const trackViewProcedure = publicProcedure.input(z.object({
  serviceType: z.enum(["hajj","umrah","hotel","flight","tour","transport"]),
  serviceId: z.number(),
  sessionId: z.string().optional(),
})).mutation(async ({ input, ctx }) => {
  const db = await getDb();
  if (!db) return;
  await db.insert(packageViews).values({
    serviceType: input.serviceType,
    serviceId: input.serviceId,
    userId: (ctx as any).user?.id,
    sessionId: input.sessionId,
  });
});

// ─── Search Router ────────────────────────────────────────────────────────────
const searchRouter = router({
  search: publicProcedure.input(z.object({
    query: z.string().min(1),
    type: z.enum(["all","hajj","umrah","hotel","flight","tour"]).default("all"),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    limit: z.number().default(20),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { hajj: [], umrah: [], hotels: [], tours: [] };
    const q = `%${input.query}%`;
    const [hajjRes, umrahRes, hotelsRes, toursRes] = await Promise.all([
      (input.type === "all" || input.type === "hajj")
        ? db.select().from(hajjPrograms).where(and(eq(hajjPrograms.isActive, true), like(hajjPrograms.title, q))).limit(input.limit)
        : Promise.resolve([]),
      (input.type === "all" || input.type === "umrah")
        ? db.select().from(umrahPrograms).where(and(eq(umrahPrograms.isActive, true), like(umrahPrograms.title, q))).limit(input.limit)
        : Promise.resolve([]),
      (input.type === "all" || input.type === "hotel")
        ? db.select().from(hotels).where(and(eq(hotels.isActive, true), like(hotels.name, q))).limit(input.limit)
        : Promise.resolve([]),
      (input.type === "all" || input.type === "tour")
        ? db.select().from(tours).where(and(eq(tours.isActive, true), like(tours.title, q))).limit(input.limit)
        : Promise.resolve([]),
    ]);
    return {
      hajj: hajjRes.map((p: any) => ({ ...p, _type: "hajj" })),
      umrah: umrahRes.map((p: any) => ({ ...p, _type: "umrah" })),
      hotels: hotelsRes.map((p: any) => ({ ...p, _type: "hotel" })),
      tours: toursRes.map((p: any) => ({ ...p, _type: "tour" })),
    };
  }),
});

// ─── Coupon Router ────────────────────────────────────────────────────────────
const couponRouter = router({
  validate: publicProcedure.input(z.object({
    code: z.string().min(1),
    serviceType: z.string(),
    totalUSD: z.number(),
    userId: z.number().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [coupon] = await db.select().from(coupons)
      .where(and(eq(coupons.code, input.code.toUpperCase()), eq(coupons.isActive, true))).limit(1);
    if (!coupon) throw new TRPCError({ code: "NOT_FOUND", message: "كوبون غير صالح" });
    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) throw new TRPCError({ code: "BAD_REQUEST", message: "الكوبون لم يبدأ بعد" });
    if (coupon.endDate && coupon.endDate < now) throw new TRPCError({ code: "BAD_REQUEST", message: "انتهت صلاحية الكوبون" });
    if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) throw new TRPCError({ code: "BAD_REQUEST", message: "تجاوز الكوبون حد الاستخدام" });
    const minOrder = parseFloat((coupon.minOrderUSD as string) ?? "0");
    if (input.totalUSD < minOrder) throw new TRPCError({ code: "BAD_REQUEST", message: `الحد الأدنى للطلب ${minOrder} دولار` });
    let discount = coupon.discountType === "percent"
      ? input.totalUSD * (parseFloat(coupon.discountValue as string) / 100)
      : parseFloat(coupon.discountValue as string);
    if (coupon.maxDiscountUSD) discount = Math.min(discount, parseFloat(coupon.maxDiscountUSD as string));
    return { couponId: coupon.id, discount: Math.round(discount * 100) / 100, name: coupon.name, discountType: coupon.discountType };
  }),
  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }),
  adminCreate: adminProcedure.input(z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    discountType: z.enum(["percent","fixed"]),
    discountValue: z.string(),
    minOrderUSD: z.string().optional(),
    maxDiscountUSD: z.string().optional(),
    usageLimit: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().default(true),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(coupons).values({
      ...input,
      code: input.code.toUpperCase(),
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    } as any);
    return { success: true };
  }),
  adminDelete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(coupons).where(eq(coupons.id, input.id));
    return { success: true };
  }),
});

// ─── Recommendation Router ────────────────────────────────────────────────────
const recommendationRouter = router({
  getForUser: publicProcedure.input(z.object({
    userId: z.number().optional(),
    sessionId: z.string().optional(),
    serviceType: z.enum(["hajj","umrah","hotel","tour","all"]).default("all"),
    limit: z.number().default(6),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const results: any[] = [];
    if (input.serviceType === "umrah" || input.serviceType === "all") {
      const pkgs = await db.select().from(umrahPrograms)
        .where(eq(umrahPrograms.isActive, true))
        .orderBy(desc(umrahPrograms.isFeatured)).limit(input.limit);
      results.push(...pkgs.map((p: any) => ({ ...p, _type: "umrah" })));
    }
    if (input.serviceType === "hajj" || input.serviceType === "all") {
      const pkgs = await db.select().from(hajjPrograms)
        .where(eq(hajjPrograms.isActive, true))
        .orderBy(desc(hajjPrograms.isFeatured)).limit(3);
      results.push(...pkgs.map((p: any) => ({ ...p, _type: "hajj" })));
    }
    return results.slice(0, input.limit);
  }),
  track: publicProcedure.input(z.object({
    eventType: z.enum(["view_package","search","add_wishlist","start_booking","complete_booking","share"]),
    serviceType: z.string().optional(),
    serviceId: z.number().optional(),
    sessionId: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return;
    await db.insert(userEvents).values({
      userId: (ctx as any).user?.id,
      sessionId: input.sessionId,
      eventType: input.eventType,
      serviceType: input.serviceType,
      serviceId: input.serviceId,
      metadata: input.metadata,
    });
  }),
});

// ─── Store Router ─────────────────────────────────────────────────────────────
const storeRouter = router({
  listCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(productCategories).where(eq(productCategories.isActive, true)).orderBy(asc(productCategories.sortOrder));
  }),

  listProducts: publicProcedure.input(z.object({
    categoryId: z.number().optional(),
    featured: z.boolean().optional(),
    search: z.string().optional(),
    limit: z.number().optional().default(24),
    offset: z.number().optional().default(0),
    sortBy: z.enum(["price_asc", "price_desc", "newest", "rating"]).optional().default("newest"),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [eq(products.isActive, true)];
    if (input.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
    if (input.featured) conditions.push(eq(products.isFeatured, true));
    if (input.search) conditions.push(like(products.name, `%${input.search}%`));
    const orderBy = input.sortBy === "price_asc" ? asc(products.priceUSD)
      : input.sortBy === "price_desc" ? desc(products.priceUSD)
      : input.sortBy === "rating" ? desc(products.rating)
      : desc(products.createdAt);
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions as [any, ...any[]]);
    return db.select().from(products).where(whereClause).orderBy(orderBy).limit(input.limit).offset(input.offset);
  }),

  getProductById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
    return result[0] ?? null;
  }),

  createOrder: publicProcedure.input(z.object({
    items: z.array(z.object({
      productId: z.number(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      imageUrl: z.string().optional(),
    })),
    subtotalUSD: z.string(),
    totalUSD: z.string(),
    shippingAddress: z.object({
      name: z.string(),
      address: z.string(),
      city: z.string(),
      country: z.string(),
      zip: z.string(),
    }).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const orderNumber = `ORD-${nanoid(8).toUpperCase()}`;
    const [result] = await db.insert(orders).values({
      userId: ctx.user?.id,
      orderNumber,
      items: input.items,
      subtotalUSD: input.subtotalUSD,
      totalUSD: input.totalUSD,
      shippingAddress: input.shippingAddress,
    } as any);
    return { success: true, orderNumber, orderId: (result as any).insertId as number };
  }),

  createProduct: adminProcedure.input(z.object({
    categoryId: z.number().optional(),
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    imageUrl: z.string().optional(),
    priceUSD: z.string(),
    originalPriceUSD: z.string().optional(),
    sku: z.string().optional(),
    stock: z.number().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(products).values(input as InsertProduct);
    return { success: true };
  }),

  updateProduct: adminProcedure.input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(products).set(input.data as any).where(eq(products.id, input.id));
    return { success: true };
  }),

  deleteProduct: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(products).where(eq(products.id, input.id));
    return { success: true };
  }),

  listOrders: adminProcedure.input(z.object({
    status: z.string().optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(input.limit).offset(input.offset);
  }),
});

// ─── Bookings Router ──────────────────────────────────────────────────────────
const bookingsRouter = router({
  create: publicProcedure.input(z.object({
    serviceType: z.enum(["hajj", "umrah", "hotel", "flight", "visa", "transport", "tour"]),
    serviceId: z.number().int().positive(),
    serviceName: z.string().max(255).optional(),
    guestName: z.string().min(1).max(255),
    guestEmail: z.string().email().max(255).optional(),
    guestPhone: z.string().min(5).max(30).optional(),
    guestCount: z.number().int().min(1).max(50).optional(),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    notes: z.string().max(2000).optional(),
    couponCode: z.string().max(40).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const guests = input.guestCount ?? 1;

    // SECURITY: derive price from authoritative DB record — NEVER trust client total.
    let unitPriceUSD = 0;
    let nights = 1;
    if (input.serviceType === "hajj") {
      const [prog] = await db.select({ price: hajjPrograms.priceUSD, seats: hajjPrograms.seatsAvailable })
        .from(hajjPrograms).where(eq(hajjPrograms.id, input.serviceId)).limit(1);
      if (!prog) throw new TRPCError({ code: "NOT_FOUND", message: "البرنامج غير موجود" });
      if ((prog.seats ?? 0) < guests) throw new TRPCError({ code: "BAD_REQUEST", message: "لا توجد مقاعد كافية في هذا البرنامج" });
      unitPriceUSD = parseFloat(prog.price as string);
    } else if (input.serviceType === "umrah") {
      const [prog] = await db.select({ price: umrahPrograms.priceUSD, seats: umrahPrograms.seatsAvailable })
        .from(umrahPrograms).where(eq(umrahPrograms.id, input.serviceId)).limit(1);
      if (!prog) throw new TRPCError({ code: "NOT_FOUND", message: "البرنامج غير موجود" });
      if ((prog.seats ?? 0) < guests) throw new TRPCError({ code: "BAD_REQUEST", message: "لا توجد مقاعد كافية في هذا البرنامج" });
      unitPriceUSD = parseFloat(prog.price as string);
    } else if (input.serviceType === "flight") {
      const [fl] = await db.select({ price: flights.priceUSD, seats: flights.seatsAvailable })
        .from(flights).where(eq(flights.id, input.serviceId)).limit(1);
      if (!fl) throw new TRPCError({ code: "NOT_FOUND", message: "الرحلة غير موجودة" });
      if ((fl.seats ?? 0) < guests) throw new TRPCError({ code: "BAD_REQUEST", message: "لا توجد مقاعد كافية في هذه الرحلة" });
      unitPriceUSD = parseFloat(fl.price as string);
    } else if (input.serviceType === "hotel") {
      const [h] = await db.select({ price: hotels.pricePerNightUSD })
        .from(hotels).where(eq(hotels.id, input.serviceId)).limit(1);
      if (!h) throw new TRPCError({ code: "NOT_FOUND", message: "الفندق غير موجود" });
      unitPriceUSD = parseFloat(h.price as string);
      // For hotels: nights = checkOut - checkIn (default 1)
      if (input.checkIn && input.checkOut) {
        const ms = new Date(input.checkOut).getTime() - new Date(input.checkIn).getTime();
        nights = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
      }
    } else if (input.serviceType === "tour") {
      const [t] = await db.select({ price: tours.priceUSD })
        .from(tours).where(eq(tours.id, input.serviceId)).limit(1);
      if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "الجولة غير موجودة" });
      unitPriceUSD = parseFloat(t.price as string);
    } else if (input.serviceType === "transport") {
      const [v] = await db.select({ price: vehicles.pricePerTripUSD })
        .from(vehicles).where(eq(vehicles.id, input.serviceId)).limit(1);
      if (!v) throw new TRPCError({ code: "NOT_FOUND", message: "المركبة غير متوفرة" });
      unitPriceUSD = parseFloat(v.price as string);
    } else if (input.serviceType === "visa") {
      const [vt] = await db.select({ price: visaTypes.priceUSD })
        .from(visaTypes).where(eq(visaTypes.id, input.serviceId)).limit(1);
      if (!vt) throw new TRPCError({ code: "NOT_FOUND", message: "نوع التأشيرة غير موجود" });
      unitPriceUSD = parseFloat(vt.price as string);
    }
    if (!Number.isFinite(unitPriceUSD) || unitPriceUSD <= 0) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "سعر غير صالح" });
    }
    const totalUSDNum = unitPriceUSD * guests * nights;

    const bookingNumber = `BK-${nanoid(8).toUpperCase()}`;
    const { couponCode: _ignoredCoupon, ...rest } = input;
    await db.insert(bookings).values({
      ...rest,
      userId: ctx.user?.id,
      bookingNumber,
      totalUSD: totalUSDNum.toFixed(2),
      checkIn: input.checkIn ? new Date(input.checkIn) : undefined,
      checkOut: input.checkOut ? new Date(input.checkOut) : undefined,
    } as any);

    // Decrement seats after successful booking
    if (input.serviceType === "hajj") {
      await db.update(hajjPrograms).set({ seatsAvailable: sql`GREATEST(seatsAvailable - ${guests}, 0)` }).where(eq(hajjPrograms.id, input.serviceId));
    } else if (input.serviceType === "umrah") {
      await db.update(umrahPrograms).set({ seatsAvailable: sql`GREATEST(seatsAvailable - ${guests}, 0)` }).where(eq(umrahPrograms.id, input.serviceId));
    } else if (input.serviceType === "flight") {
      await db.update(flights).set({ seatsAvailable: sql`GREATEST(seatsAvailable - ${guests}, 0)` }).where(eq(flights.id, input.serviceId));
    }

    return { success: true, bookingNumber, totalUSD: totalUSDNum.toFixed(2) };
  }),

  listAll: adminProcedure.input(z.object({
    serviceType: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().optional().default(20),
    offset: z.number().optional().default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions = [];
    if (input.serviceType) conditions.push(eq(bookings.serviceType, input.serviceType as any));
    if (input.status) conditions.push(eq(bookings.status, input.status as any));
    const query = db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(input.limit).offset(input.offset);
    if (conditions.length > 0) return (query as any).where(and(...conditions));
    return query;
  }),

  updateStatus: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "confirmed", "cancelled", "completed", "refunded"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(bookings).set({ status: input.status }).where(eq(bookings.id, input.id));
    return { success: true };
  }),

  getByRef: publicProcedure.input(z.object({ ref: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(bookings).where(eq((bookings as any).bookingNumber, input.ref)).limit(1);
    return result[0] ?? null;
  }),
});

// ─── Admin Stats Router ───────────────────────────────────────────────────────
const adminRouter = router({
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { hajj: 0, umrah: 0, hotels: 0, flights: 0, visaTypes: 0, vehicles: 0, tours: 0, products: 0, bookings: 0, orders: 0 };
    const [
      [hajjCount], [umrahCount], [hotelsCount], [flightsCount],
      [visaCount], [vehiclesCount], [toursCount], [productsCount],
      [bookingsCount], [ordersCount],
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(hajjPrograms),
      db.select({ count: sql<number>`count(*)` }).from(umrahPrograms),
      db.select({ count: sql<number>`count(*)` }).from(hotels),
      db.select({ count: sql<number>`count(*)` }).from(flights),
      db.select({ count: sql<number>`count(*)` }).from(visaTypes),
      db.select({ count: sql<number>`count(*)` }).from(vehicles),
      db.select({ count: sql<number>`count(*)` }).from(tours),
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ count: sql<number>`count(*)` }).from(bookings),
      db.select({ count: sql<number>`count(*)` }).from(orders),
    ]);
    return {
      hajj: Number(hajjCount?.count ?? 0),
      umrah: Number(umrahCount?.count ?? 0),
      hotels: Number(hotelsCount?.count ?? 0),
      flights: Number(flightsCount?.count ?? 0),
      visaTypes: Number(visaCount?.count ?? 0),
      vehicles: Number(vehiclesCount?.count ?? 0),
      tours: Number(toursCount?.count ?? 0),
      products: Number(productsCount?.count ?? 0),
      bookings: Number(bookingsCount?.count ?? 0),
      orders: Number(ordersCount?.count ?? 0),
    };
  }),

  recentBookings: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(bookings).orderBy(desc(bookings.createdAt)).limit(10);
  }),

   recentOrders: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);
  }),
  listUsers: adminProcedure
    .input(z.object({ limit: z.number().default(200) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      }).from(users).orderBy(desc(users.createdAt)).limit(input.limit);
    }),
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number().int().positive(),
      role: z.enum(["admin", "user"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change your own role" });
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),
  // ─── Enhanced User Management ────────────────────────────────────────────
  listUsersPaginated: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(500).default(50),
      offset: z.number().default(0),
      search: z.string().optional(),
      role: z.enum(["all", "user", "admin", "provider", "marketer"]).default("all"),
      status: z.enum(["all", "active", "banned"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { rows: [], total: 0 };
      const conditions: any[] = [];
      if (input.role !== "all") conditions.push(eq(users.role, input.role as any));
      if (input.status === "active") conditions.push(eq(users.isBanned, false));
      if (input.status === "banned") conditions.push(eq(users.isBanned, true));
      if (input.search) {
        const s = `%${input.search}%`;
        conditions.push(sql`(${users.name} LIKE ${s} OR ${users.email} LIKE ${s} OR ${users.phone} LIKE ${s})`);
      }
      const whereClause = conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions);
      const [rows, [countRow]] = await Promise.all([
        db.select({
          id: users.id, name: users.name, email: users.email, phone: users.phone,
          role: users.role, isBanned: users.isBanned, banReason: users.banReason,
          loginMethod: users.loginMethod, nationality: users.nationality,
          createdAt: users.createdAt, lastSignedIn: users.lastSignedIn,
        }).from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(input.limit).offset(input.offset),
        db.select({ count: sql<number>`COUNT(*)` }).from(users).where(whereClause),
      ]);
      return { rows, total: Number(countRow?.count ?? 0) };
    }),
  editUser: adminProcedure
    .input(z.object({
      userId: z.number().int().positive(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      nationality: z.string().optional(),
      role: z.enum(["user", "admin", "provider", "marketer"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { userId, ...updates } = input;
      const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
      await db.update(users).set(filtered).where(eq(users.id, userId));
      return { success: true };
    }),
  banUser: adminProcedure
    .input(z.object({ userId: z.number().int().positive(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكنك حظر نفسك" });
      await db.update(users).set({ isBanned: true, banReason: input.reason ?? null }).where(eq(users.id, input.userId));
      return { success: true };
    }),
  unbanUser: adminProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(users).set({ isBanned: false, banReason: null }).where(eq(users.id, input.userId));
      return { success: true };
    }),
  deleteUserById: adminProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكنك حذف حسابك" });
      await db.delete(users).where(eq(users.id, input.userId));
      return { success: true };
    }),
  sendBulkEmail: adminProcedure
    .input(z.object({
      targetGroup: z.enum(["all", "active", "banned", "custom"]).default("all"),
      customUserIds: z.array(z.number()).optional(),
      subject: z.string().min(1),
      templateType: z.enum(["announcement", "offer", "newsletter", "reminder", "custom"]),
      title: z.string().min(1),
      body: z.string().min(1),
      ctaText: z.string().optional(),
      ctaUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      let targetUsers: { email: string | null; name: string | null }[] = [];
      if (input.targetGroup === "custom" && input.customUserIds?.length) {
        targetUsers = await db.select({ email: users.email, name: users.name })
          .from(users).where(sql`${users.id} IN (${sql.join(input.customUserIds.map(id => sql`${id}`), sql`, `)})`);
      } else {
        const conditions: any[] = [];
        if (input.targetGroup === "active") conditions.push(eq(users.isBanned, false));
        if (input.targetGroup === "banned") conditions.push(eq(users.isBanned, true));
        const whereClause = conditions.length === 0 ? undefined : conditions[0];
        targetUsers = await db.select({ email: users.email, name: users.name }).from(users).where(whereClause);
      }
      const validEmails = targetUsers.filter(u => u.email && u.email.includes("@"));
      if (validEmails.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يوجد مستخدمون بعناوين بريد صالحة" });
      const { sendBulkCampaign } = await import("./email");
      const result = await sendBulkCampaign({
        recipients: validEmails as { email: string; name: string | null }[],
        subject: input.subject,
        templateType: input.templateType,
        title: input.title,
        body: input.body,
        ctaText: input.ctaText,
        ctaUrl: input.ctaUrl,
      });
      return { success: true, sent: result.sent, failed: result.failed, total: validEmails.length };
    }),
  sendWhatsAppBroadcast: adminProcedure
    .input(z.object({
      targetGroup: z.enum(["all", "active", "custom"]).default("all"),
      customUserIds: z.array(z.number()).optional(),
      message: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      let targetUsers: { phone: string | null; name: string | null }[] = [];
      if (input.targetGroup === "custom" && input.customUserIds?.length) {
        targetUsers = await db.select({ phone: users.phone, name: users.name })
          .from(users).where(sql`${users.id} IN (${sql.join(input.customUserIds.map(id => sql`${id}`), sql`, `)})`);
      } else {
        const conditions: any[] = [];
        if (input.targetGroup === "active") conditions.push(eq(users.isBanned, false));
        const whereClause = conditions.length === 0 ? undefined : conditions[0];
        targetUsers = await db.select({ phone: users.phone, name: users.name }).from(users).where(whereClause);
      }
      const withPhone = targetUsers.filter(u => u.phone && u.phone.trim().length > 5);
      const numbers = withPhone.map(u => u.phone!.replace(/[^0-9+]/g, ""));
      return { success: true, numbers, total: numbers.length, message: input.message };
    }),
});
// ─── Localization & Currency Router ─────────────────────────────────────────
const localizationRouter = router({
  getExchangeRates: publicProcedure.query(async () => {
    // Fetch live rates from a free public API (SAR base — all prices stored in SAR)
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/SAR",
        { signal: AbortSignal.timeout(5000) }
      );
      if (!response.ok) throw new Error("Rate fetch failed");
      const data = await response.json() as { rates: Record<string, number> };
      const r = data.rates;
      return {
        SAR: 1.0,
        USD: r["USD"] ?? 0.2667,
        EUR: r["EUR"] ?? 0.2453,
        GBP: r["GBP"] ?? 0.2107,
        PKR: r["PKR"] ?? 74.27,
        INR: r["INR"] ?? 22.19,
        EGP: r["EGP"] ?? 12.93,
      };
    } catch {
      // Return fallback rates relative to SAR if API is unavailable
      return { SAR: 1.0, USD: 0.2667, EUR: 0.2453, GBP: 0.2107, PKR: 74.27, INR: 22.19, EGP: 12.93 };
    }
  }),

  getCurrencyOffsets: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const settings = await db.select().from(siteSettings)
      .where(like(siteSettings.key, "currency_offset_%"));
    return settings.map(s => ({
      currency: s.key.replace("currency_offset_", ""),
      offset: parseFloat(s.value || "0"),
    }));
  }),

  updateCurrencyOffset: adminProcedure
    .input(z.object({
      currency: z.enum(["SAR", "USD", "EUR", "GBP", "PKR", "INR", "EGP"]),
      offset: z.number().min(-50).max(100),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const key = `currency_offset_${input.currency}`;
      await db.insert(siteSettings).values({ key, value: String(input.offset), type: "number", category: "currency" })
        .onDuplicateKeyUpdate({ set: { value: String(input.offset) } });
      return { success: true };
    }),

  getTranslationOverrides: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const settings = await db.select().from(siteSettings)
      .where(like(siteSettings.key, "translation_%"));
    return settings.map(s => ({ key: s.key, value: s.value || "", category: s.category || "" }));
  }),

  updateTranslationOverride: adminProcedure
    .input(z.object({
      key: z.string().min(1),
      value: z.string(),
      label: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(siteSettings).values({ key: input.key, value: input.value, type: "string", category: "translation" })
        .onDuplicateKeyUpdate({ set: { value: input.value } });
      return { success: true };
    }),
});

// ─── Passport OCR Router ────────────────────────────────────────────────────
const passportRouter = router({
  // Extract passport data using LLM vision
  extractOCR: publicProcedure.input(z.object({
    imageUrl: z.string().url(),
    userId: z.number().optional(),
    bookingId: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a passport OCR expert. Extract all data from the passport image and return it as structured JSON. Be precise and accurate."
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: input.imageUrl, detail: "high" }
              },
              {
                type: "text",
                text: "Extract all passport data from this image. Return JSON with fields: passportNumber, fullName, nationality, dateOfBirth (YYYY-MM-DD), expiryDate (YYYY-MM-DD), gender (M/F), placeOfBirth, mrz (machine readable zone lines). If a field is not visible, use null."
              }
            ]
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "passport_data",
            strict: true,
            schema: {
              type: "object",
              properties: {
                passportNumber: { type: ["string", "null"] },
                fullName: { type: ["string", "null"] },
                nationality: { type: ["string", "null"] },
                dateOfBirth: { type: ["string", "null"] },
                expiryDate: { type: ["string", "null"] },
                gender: { type: ["string", "null"] },
                placeOfBirth: { type: ["string", "null"] },
                mrz: { type: ["string", "null"] },
              },
              required: ["passportNumber", "fullName", "nationality", "dateOfBirth", "expiryDate", "gender", "placeOfBirth", "mrz"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices[0]?.message?.content;
      const extracted = typeof content === "string" ? JSON.parse(content) : content;
      // Save to DB — encrypt sensitive fields (PDPL compliance)
      await db.insert(passportRecords).values({
        userId: input.userId,
        bookingId: input.bookingId,
        imageUrl: input.imageUrl,
        passportNumber: extracted.passportNumber ? encrypt(extracted.passportNumber) : null,
        fullName: extracted.fullName ? encrypt(extracted.fullName) : null,
        nationality: extracted.nationality,           // غير حساس
        dateOfBirth: extracted.dateOfBirth ? encrypt(extracted.dateOfBirth) : null,
        expiryDate: extracted.expiryDate,             // غير حساس
        gender: extracted.gender,                     // غير حساس
        placeOfBirth: extracted.placeOfBirth ? encrypt(extracted.placeOfBirth) : null,
        mrz: extracted.mrz ? encrypt(extracted.mrz) : null,
        confidence: "95.00",
        rawOcrData: null,   // لا تخزّن rawOcrData (يحتوي بيانات أكثر من اللازم)
        status: "pending",
      });
      // Return to client without MRZ (never expose MRZ)
      return {
        success: true,
        data: {
          passportNumber: extracted.passportNumber,
          fullName: extracted.fullName,
          nationality: extracted.nationality,
          dateOfBirth: extracted.dateOfBirth,
          expiryDate: extracted.expiryDate,
          gender: extracted.gender,
          placeOfBirth: extracted.placeOfBirth,
          mrz: null,  // لا تُعيد MRZ للـ client أبداً
        },
      };
    } catch (err) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "OCR extraction failed" });
    }
  }),
  // Upload passport image to S3
  uploadImage: publicProcedure.input(z.object({
    base64: z.string(),
    mimeType: z.string().default("image/jpeg"),
    userId: z.number().optional(),
  })).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
    const key = `passports/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { url } = await storagePut(key, buffer, input.mimeType);
    return { url };
  }),
  // List passport records (admin)
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(passportRecords).orderBy(desc(passportRecords.createdAt)).limit(50);
  }),
});

// ─── Train Booking Router (Haramain High-Speed Railway) ───────────────────────
const trainRouter = router({
  // Search available trains
  search: publicProcedure.input(z.object({
    fromStation: z.enum(["makkah", "jeddah", "madinah", "king_abdulaziz"]),
    toStation: z.enum(["makkah", "jeddah", "madinah", "king_abdulaziz"]),
    travelDate: z.string(),
    passengers: z.number().min(1).max(20).default(1),
    trainClass: z.enum(["economy", "business", "vip"]).default("economy"),
  })).query(async ({ input }) => {
    // Haramain Railway schedule simulation
    const ROUTES: Record<string, Record<string, { duration: string; basePrice: number }>> = {
      makkah: {
        madinah: { duration: "2h 15m", basePrice: 45 },
        jeddah: { duration: "0h 45m", basePrice: 15 },
        king_abdulaziz: { duration: "1h 00m", basePrice: 20 },
      },
      madinah: {
        makkah: { duration: "2h 15m", basePrice: 45 },
        jeddah: { duration: "1h 45m", basePrice: 35 },
        king_abdulaziz: { duration: "2h 30m", basePrice: 50 },
      },
      jeddah: {
        makkah: { duration: "0h 45m", basePrice: 15 },
        madinah: { duration: "1h 45m", basePrice: 35 },
        king_abdulaziz: { duration: "0h 15m", basePrice: 8 },
      },
      king_abdulaziz: {
        makkah: { duration: "1h 00m", basePrice: 20 },
        madinah: { duration: "2h 30m", basePrice: 50 },
        jeddah: { duration: "0h 15m", basePrice: 8 },
      },
    };
    const CLASS_MULTIPLIER = { economy: 1, business: 1.8, vip: 2.8 };
    const route = ROUTES[input.fromStation]?.[input.toStation];
    if (!route) throw new TRPCError({ code: "BAD_REQUEST", message: "Route not available" });
    const basePrice = route.basePrice * CLASS_MULTIPLIER[input.trainClass] * input.passengers;
    const departureTimes = ["06:00", "08:30", "10:00", "12:30", "14:00", "16:30", "18:00", "20:30"];
    // Parse duration string (e.g. "2h 15m") into minutes
    const durationMatch = route.duration.match(/(\d+)h\s*(\d+)m/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2]) : 60;
    const addMinutes = (time: string, mins: number) => {
      const [h, m] = time.split(":").map(Number);
      const total = h * 60 + m + mins;
      return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };
    return departureTimes.map((time, i) => ({
      trainId: `HR-${input.fromStation.slice(0,2).toUpperCase()}-${input.toStation.slice(0,2).toUpperCase()}-${i + 1}`,
      departureTime: time,
      arrivalTime: addMinutes(time, durationMinutes),
      duration: route.duration,
      trainClass: input.trainClass,
      passengers: input.passengers,
      priceUSD: basePrice,
      seatsAvailable: Math.floor(Math.random() * 50) + 10,
      trainNumber: `HHR-${1000 + i}`,
      amenities: input.trainClass === "vip" ? ["WiFi", "Meals", "Priority Boarding", "Lounge Access"] :
                 input.trainClass === "business" ? ["WiFi", "Snacks", "Priority Boarding"] :
                 ["WiFi", "Standard Seating"],
    }));
  }),
  // Book a train ticket
  book: publicProcedure.input(z.object({
    fromStation: z.enum(["makkah", "jeddah", "madinah", "king_abdulaziz"]),
    toStation: z.enum(["makkah", "jeddah", "madinah", "king_abdulaziz"]),
    travelDate: z.string(),
    returnDate: z.string().optional(),
    trainClass: z.enum(["economy", "business", "vip"]).default("economy"),
    passengers: z.number().min(1).max(20),
    priceUSD: z.string(),
    passengerName: z.string().min(1),
    passengerEmail: z.string().email().optional(),
    passengerPhone: z.string().optional(),
    passportNumber: z.string().optional(),
    umrahProgramId: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const bookingRef = `TR-${nanoid(8).toUpperCase()}`;
    await db.insert(trainBookings).values({
      bookingRef,
      userId: ctx.user?.id,
      umrahProgramId: input.umrahProgramId,
      passengerName: input.passengerName,
      passengerEmail: input.passengerEmail,
      passengerPhone: input.passengerPhone,
      passportNumber: input.passportNumber,
      fromStation: input.fromStation,
      toStation: input.toStation,
      travelDate: new Date(input.travelDate),
      returnDate: input.returnDate ? new Date(input.returnDate) : undefined,
      trainClass: input.trainClass,
      passengers: input.passengers,
      priceUSD: input.priceUSD,
      status: "confirmed",
      seatNumbers: Array.from({ length: input.passengers }, (_, i) => `${String.fromCharCode(65 + Math.floor(i / 4))}${(i % 4) + 1}`),
    } as any);
    return { success: true, bookingRef };
  }),
  // List all train bookings (admin)
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(trainBookings).orderBy(desc(trainBookings.createdAt)).limit(100);
  }),
  // Get user's train bookings
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(trainBookings).where(eq(trainBookings.userId, ctx.user.id)).orderBy(desc(trainBookings.createdAt));
  }),
});

// ─── Dynamic Pricing Engine Router ───────────────────────────────────────────
const dynamicPricingRouter = router({
  // Calculate price with all active rules applied
  calculate: publicProcedure.input(z.object({
    basePrice: z.number(),
    serviceType: z.enum(["hajj", "umrah", "hotel", "flight", "all"]),
    departureDaysAhead: z.number().optional(),
    groupSize: z.number().optional().default(1),
    occupancyPercent: z.number().optional(),
    travelDate: z.string().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { finalPrice: input.basePrice, discounts: [], totalDiscountPercent: 0 };
    const rules = await db.select().from(dynamicPricingRules)
      .where(and(
        eq(dynamicPricingRules.isActive, true),
        or(
          eq(dynamicPricingRules.serviceType, input.serviceType),
          eq(dynamicPricingRules.serviceType, "all"),
        )
      ))
      .orderBy(desc(dynamicPricingRules.priority));
    const appliedDiscounts: { name: string; percent: number; type: string }[] = [];
    let totalDiscount = 0;
    for (const rule of rules) {
      let applies = false;
      if (rule.type === "early_bird" && input.departureDaysAhead !== undefined) {
        const minDays = rule.minDaysAhead ?? 0;
        const maxDays = rule.maxDaysAhead ?? 999;
        applies = input.departureDaysAhead >= minDays && input.departureDaysAhead <= maxDays;
      } else if (rule.type === "group" && input.groupSize !== undefined) {
        applies = input.groupSize >= (rule.minGroupSize ?? 1);
      } else if (rule.type === "seasonal" && input.travelDate) {
        const now = new Date();
        const start = rule.startDate ? new Date(rule.startDate) : null;
        const end = rule.endDate ? new Date(rule.endDate) : null;
        const travel = new Date(input.travelDate);
        applies = (!start || travel >= start) && (!end || travel <= end);
      } else if (rule.type === "last_minute" && input.departureDaysAhead !== undefined) {
        applies = input.departureDaysAhead <= (rule.maxDaysAhead ?? 7);
      } else if (rule.type === "occupancy" && input.occupancyPercent !== undefined) {
        applies = input.occupancyPercent >= Number(rule.minOccupancyPercent ?? 80);
      }
      if (applies) {
        const discount = Number(rule.discountPercent);
        appliedDiscounts.push({ name: rule.name, percent: discount, type: rule.type });
        totalDiscount = Math.min(totalDiscount + discount, 50); // cap at 50%
      }
    }
    const finalPrice = input.basePrice * (1 - totalDiscount / 100);
    return { finalPrice: Math.round(finalPrice * 100) / 100, discounts: appliedDiscounts, totalDiscountPercent: totalDiscount };
  }),
  // Admin: list all rules
  listRules: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(dynamicPricingRules).orderBy(desc(dynamicPricingRules.priority));
  }),
  // Admin: create/update rule
  upsertRule: adminProcedure.input(z.object({
    ruleId: z.string(),
    name: z.string(),
    type: z.enum(["seasonal", "early_bird", "last_minute", "group", "occupancy"]),
    serviceType: z.enum(["hajj", "umrah", "hotel", "flight", "all"]).default("all"),
    discountPercent: z.number().min(0).max(50),
    minDaysAhead: z.number().optional(),
    maxDaysAhead: z.number().optional(),
    minGroupSize: z.number().optional(),
    minOccupancyPercent: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().default(true),
    priority: z.number().default(0),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(dynamicPricingRules).values({
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      discountPercent: String(input.discountPercent),
      minOccupancyPercent: input.minOccupancyPercent ? String(input.minOccupancyPercent) : undefined,
    } as any).onDuplicateKeyUpdate({ set: {
      name: input.name,
      type: input.type,
      serviceType: input.serviceType,
      discountPercent: String(input.discountPercent),
      minDaysAhead: input.minDaysAhead,
      maxDaysAhead: input.maxDaysAhead,
      minGroupSize: input.minGroupSize,
      isActive: input.isActive,
      priority: input.priority,
    }});
    return { success: true };
  }),
  // Admin: delete rule
  deleteRule: adminProcedure.input(z.object({ ruleId: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(dynamicPricingRules).where(eq(dynamicPricingRules.ruleId, input.ruleId));
    return { success: true };
  }),
  // Seed default pricing rules
  seedDefaults: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const defaults = [
      { ruleId: "early_bird_90d", name: "Early Bird — 90+ Days", type: "early_bird" as const, serviceType: "all" as const, discountPercent: "15.00", minDaysAhead: 90, priority: 10, isActive: true },
      { ruleId: "early_bird_60d", name: "Early Bird — 60+ Days", type: "early_bird" as const, serviceType: "all" as const, discountPercent: "10.00", minDaysAhead: 60, maxDaysAhead: 89, priority: 9, isActive: true },
      { ruleId: "early_bird_30d", name: "Early Bird — 30+ Days", type: "early_bird" as const, serviceType: "all" as const, discountPercent: "5.00", minDaysAhead: 30, maxDaysAhead: 59, priority: 8, isActive: true },
      { ruleId: "group_10plus", name: "Group Discount — 10+ Travelers", type: "group" as const, serviceType: "all" as const, discountPercent: "12.00", minGroupSize: 10, priority: 7, isActive: true },
      { ruleId: "group_5plus", name: "Group Discount — 5+ Travelers", type: "group" as const, serviceType: "all" as const, discountPercent: "7.00", minGroupSize: 5, priority: 6, isActive: true },
      { ruleId: "last_minute_7d", name: "Last Minute — 7 Days or Less", type: "last_minute" as const, serviceType: "all" as const, discountPercent: "20.00", maxDaysAhead: 7, priority: 5, isActive: true },
      { ruleId: "ramadan_2025", name: "Ramadan Season 2025", type: "seasonal" as const, serviceType: "umrah" as const, discountPercent: "8.00", startDate: new Date("2025-02-28"), endDate: new Date("2025-03-30"), priority: 4, isActive: true },
    ];
    for (const rule of defaults) {
      await db.insert(dynamicPricingRules).values(rule as any).onDuplicateKeyUpdate({ set: { isActive: rule.isActive } });
    }
    return { success: true, count: defaults.length };
  }),
});

// ─── Hajj Domestic Router (حجاج الداخل) ─────────────────────────────────────────────────────────────────────────────────
const hajjDomesticRouter = router({
  // List companies
  listCompanies: publicProcedure.input(z.object({
    city: z.string().optional(),
    search: z.string().optional(),
    featured: z.boolean().optional(),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { companies: [], total: 0 };
    const conditions = [eq(hajjCompanies.isActive, true)];
    if (input.city) conditions.push(like(hajjCompanies.city, `%${input.city}%`));
    if (input.featured) conditions.push(eq(hajjCompanies.isFeatured, true));
    if (input.search) conditions.push(or(like(hajjCompanies.nameAr, `%${input.search}%`), like(hajjCompanies.nameEn, `%${input.search}%`)) as any);
    const companies = await db.select().from(hajjCompanies).where(and(...conditions)).orderBy(desc(hajjCompanies.isFeatured), asc(hajjCompanies.sortOrder)).limit(input.limit).offset(input.offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(hajjCompanies).where(and(...conditions));
    return { companies, total: Number(count) };
  }),
  // Get single company
  getCompany: publicProcedure.input(z.object({ companyId: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(hajjCompanies).where(eq(hajjCompanies.companyId, input.companyId));
    return rows[0] ?? null;
  }),
  // Get company reviews
  getReviews: publicProcedure.input(z.object({
    companyId: z.string(),
    limit: z.number().min(1).max(20).default(10),
    offset: z.number().min(0).default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { reviews: [], total: 0 };
    const reviews = await db.select().from(hajjCompanyReviews)
      .where(and(eq(hajjCompanyReviews.companyId, input.companyId), eq(hajjCompanyReviews.isApproved, true), eq(hajjCompanyReviews.isHidden, false)))
      .orderBy(desc(hajjCompanyReviews.createdAt)).limit(input.limit).offset(input.offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(hajjCompanyReviews)
      .where(and(eq(hajjCompanyReviews.companyId, input.companyId), eq(hajjCompanyReviews.isApproved, true)));
    return { reviews, total: Number(count) };
  }),
  // Submit review (verified pilgrim)
  submitReview: publicProcedure.input(z.object({
    companyId: z.string(),
    reviewerName: z.string().min(2).max(100),
    reviewerEmail: z.string().email().optional(),
    bookingReference: z.string().optional(),
    rating: z.number().int().min(1).max(5),
    ratingService: z.number().int().min(1).max(5).optional(),
    ratingAccommodation: z.number().int().min(1).max(5).optional(),
    ratingTransport: z.number().int().min(1).max(5).optional(),
    ratingFood: z.number().int().min(1).max(5).optional(),
    reviewText: z.string().min(10).max(2000).optional(),
    hajjYear: z.number().int().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    // Check if booking reference is valid for verification
    let isVerifiedPilgrim = false;
    if (input.bookingReference) {
      const booking = await db.select().from(bookings).where(eq((bookings as any).bookingRef ?? (bookings as any).id, input.bookingReference));
      if (booking.length > 0) isVerifiedPilgrim = true;
    }
    await db.insert(hajjCompanyReviews).values({
      ...input,
      isVerifiedPilgrim,
      isApproved: isVerifiedPilgrim, // Auto-approve verified pilgrims
    });
    // Update company average rating
    if (isVerifiedPilgrim) {
      const allReviews = await db.select({ rating: hajjCompanyReviews.rating }).from(hajjCompanyReviews)
        .where(and(eq(hajjCompanyReviews.companyId, input.companyId), eq(hajjCompanyReviews.isApproved, true)));
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await db.update(hajjCompanies).set({ averageRating: avg.toFixed(2), totalReviews: allReviews.length }).where(eq(hajjCompanies.companyId, input.companyId));
    }
    return { success: true, isVerifiedPilgrim, message: isVerifiedPilgrim ? "تم نشر تقييمك بنجاح" : "سيتم مراجعة تقييمك قبل النشر" };
  }),
  // List notifications/news
  listNotifications: publicProcedure.input(z.object({
    category: z.enum(["news", "alert", "announcement", "article", "update", "all"]).default("all"),
    limit: z.number().min(1).max(20).default(10),
    offset: z.number().min(0).default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { items: [], total: 0 };
    const conditions = [eq(hajjDomesticNotifications.isPublished, true)];
    if (input.category !== "all") conditions.push(eq(hajjDomesticNotifications.category, input.category as any));
    const items = await db.select().from(hajjDomesticNotifications).where(and(...conditions))
      .orderBy(desc(hajjDomesticNotifications.isPinned), desc(hajjDomesticNotifications.publishedAt)).limit(input.limit).offset(input.offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(hajjDomesticNotifications).where(and(...conditions));
    return { items, total: Number(count) };
  }),
  // Subscribe to notifications
  subscribe: publicProcedure.input(z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    whatsapp: z.string().optional(),
    subscriptionType: z.enum(["email", "whatsapp", "both"]).default("email"),
    topics: z.array(z.string()).default(["hajj_domestic"]),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (!input.email && !input.whatsapp) throw new TRPCError({ code: "BAD_REQUEST", message: "يجب توفير بريد إلكتروني أو رقم واتسآب" });
    await db.insert(notificationSubscribers).values(input);
    return { success: true };
  }),
  // Admin: add company
  addCompany: adminProcedure.input(z.object({
    nameAr: z.string().min(2),
    nameEn: z.string().optional(),
    licenseNumber: z.string().optional(),
    logoUrl: z.string().optional(),
    coverImageUrl: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().optional(),
    description: z.string().optional(),
    nusukProfileUrl: z.string().optional(),
    yearsExperience: z.number().int().optional(),
    isVerified: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { nanoid } = await import("nanoid");
    const companyId = `company_${nanoid(10)}`;
    await db.insert(hajjCompanies).values({ ...input, companyId });
    return { success: true, companyId };
  }),
  // Admin: update company
  updateCompany: adminProcedure.input(z.object({
    companyId: z.string(),
    nameAr: z.string().optional(),
    nameEn: z.string().optional(),
    licenseNumber: z.string().optional(),
    logoUrl: z.string().optional(),
    coverImageUrl: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional(),
    description: z.string().optional(),
    nusukProfileUrl: z.string().optional(),
    isVerified: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { companyId, ...data } = input;
    await db.update(hajjCompanies).set(data).where(eq(hajjCompanies.companyId, companyId));
    return { success: true };
  }),
  // Admin: delete company
  deleteCompany: adminProcedure.input(z.object({ companyId: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(hajjCompanies).where(eq(hajjCompanies.companyId, input.companyId));
    return { success: true };
  }),
  // Admin: add notification/news
  addNotification: adminProcedure.input(z.object({
    titleAr: z.string().min(5),
    titleEn: z.string().optional(),
    contentAr: z.string().min(10),
    contentEn: z.string().optional(),
    category: z.enum(["news", "alert", "announcement", "article", "update"]).default("news"),
    imageUrl: z.string().optional(),
    sourceUrl: z.string().optional(),
    isUrgent: z.boolean().default(false),
    isPinned: z.boolean().default(false),
    sendEmail: z.boolean().default(false),
    sendWhatsapp: z.boolean().default(false),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { nanoid } = await import("nanoid");
    const notifId = `notif_${nanoid(10)}`;
    const { sendEmail, sendWhatsapp, ...notifData } = input;
    await db.insert(hajjDomesticNotifications).values({ ...notifData, notifId });
    // Get subscriber count for tracking
    const subscribers = await db.select().from(notificationSubscribers).where(eq(notificationSubscribers.isActive, true));
    const emailSubs = subscribers.filter(s => s.subscriptionType === "email" || s.subscriptionType === "both");
    const whatsappSubs = subscribers.filter(s => s.subscriptionType === "whatsapp" || s.subscriptionType === "both");
    let recipientCount = 0;
    if (sendEmail) recipientCount += emailSubs.length;
    if (sendWhatsapp) recipientCount += whatsappSubs.length;
    if (recipientCount > 0) {
      await db.update(hajjDomesticNotifications).set({
        sentViaEmail: sendEmail,
        sentViaWhatsapp: sendWhatsapp,
        emailSentAt: sendEmail ? new Date() : undefined,
        whatsappSentAt: sendWhatsapp ? new Date() : undefined,
        recipientCount,
      }).where(eq(hajjDomesticNotifications.notifId, notifId));
    }
    return { success: true, notifId, recipientCount };
  }),
  // Admin: approve review
  approveReview: adminProcedure.input(z.object({ reviewId: z.number(), approved: z.boolean() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(hajjCompanyReviews).set({ isApproved: input.approved }).where(eq(hajjCompanyReviews.id, input.reviewId));
    return { success: true };
  }),
  // Admin: list all reviews pending approval
  listPendingReviews: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(hajjCompanyReviews).where(eq(hajjCompanyReviews.isApproved, false)).orderBy(desc(hajjCompanyReviews.createdAt));
  }),
  // Admin: list subscribers
  listSubscribers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(notificationSubscribers).where(eq(notificationSubscribers.isActive, true)).orderBy(desc(notificationSubscribers.createdAt));
  }),
  // Create domestic package
  createPackage: adminProcedure.input(z.object({
    title: z.string().min(3),
    packageNumber: z.string().optional(),
    priceFromSAR: z.number().optional(),
    priceToSAR: z.number().optional(),
    minyaSleeping: z.string().optional(),
    arafatSleeping: z.string().optional(),
    packageNotes: z.string().optional(),
    ownerName: z.string().optional(),
    isAvailable: z.boolean().default(true),
    imageUrl: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const [result] = await db.insert(hajjPrograms).values({
      title: input.title,
      packageNumber: input.packageNumber,
      priceFromSAR: input.priceFromSAR !== undefined ? String(Math.round(input.priceFromSAR)) : undefined,
      priceToSAR: input.priceToSAR !== undefined ? String(Math.round(input.priceToSAR)) : undefined,
      minyaSleeping: input.minyaSleeping,
      arafatSleeping: input.arafatSleeping,
      packageNotes: input.packageNotes,
      ownerName: input.ownerName,
      isAvailable: input.isAvailable,
      imageUrl: input.imageUrl,
      portalType: "internal",
      category: "domestic",
      priceUSD: "0",
      duration: 5,
      seatsTotal: 50,
      seatsAvailable: 50,
      isActive: true,
    });
    return { id: result.insertId, ...input };
  }),
  // Get domestic packages
  listDomestic: publicProcedure.input(z.object({
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { packages: [], total: 0 };
    const packages = await db.select().from(hajjPrograms)
      .where(and(eq(hajjPrograms.portalType, "internal"), eq(hajjPrograms.isActive, true)))
      .orderBy(desc(hajjPrograms.isFeatured), asc(hajjPrograms.sortOrder))
      .limit(input.limit).offset(input.offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(hajjPrograms)
      .where(and(eq(hajjPrograms.portalType, "internal"), eq(hajjPrograms.isActive, true)));
    return { packages, total: Number(count) };
  }),
  // جلب باقات حجاج الداخل
  listPackages: publicProcedure.input(z.object({
    nusukPackageType: z.string().optional(),
    isAvailable: z.boolean().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions: any[] = [eq(hajjPrograms.isActive, true), eq(hajjPrograms.portalType, "internal" as any)];
    if (input.nusukPackageType) conditions.push(eq(hajjPrograms.nusukPackageType, input.nusukPackageType));
    if (input.isAvailable !== undefined) conditions.push(eq(hajjPrograms.isAvailable as any, input.isAvailable));
    return db.select().from(hajjPrograms)
      .where(and(...conditions as [any, ...any[]]))
      .orderBy(asc(hajjPrograms.sortOrder), desc(hajjPrograms.isFeatured));
  }),
  // إضافة باقة داخلية
  addPackage: adminProcedure.input(z.object({
    packageNumber: z.string().optional(),
    title: z.string().min(2),
    nusukPackageType: z.enum(["developed_camps", "undeveloped_camps", "mina_towers", "economy"]),
    isAvailable: z.boolean().default(true),
    description: z.string().optional(),
    minyaSleeping: z.string().optional(),
    arafatSleeping: z.string().optional(),
    packageNotes: z.string().optional(),
    priceFromSAR: z.number().optional(),
    priceToSAR: z.number().optional(),
    imageUrl: z.string().optional(),
    isFeatured: z.boolean().default(false),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(hajjPrograms).values({
      title: input.title,
      packageNumber: input.packageNumber,
      nusukPackageType: input.nusukPackageType,
      isAvailable: input.isAvailable ?? true,
      description: input.description,
      minyaSleeping: input.minyaSleeping,
      arafatSleeping: input.arafatSleeping,
      packageNotes: input.packageNotes,
      priceFromSAR: input.priceFromSAR !== undefined ? String(Math.round(input.priceFromSAR)) : undefined,
      priceToSAR: input.priceToSAR !== undefined ? String(Math.round(input.priceToSAR)) : undefined,
      imageUrl: input.imageUrl,
      isFeatured: input.isFeatured,
      portalType: "internal",
      priceUSD: String(sarToUsd(input.priceFromSAR ?? 0)),
      category: input.nusukPackageType,
      isActive: true,
    } as any);
    return { success: true };
  }),
  // تعديل باقة داخلية
  updatePackage: adminProcedure.input(z.object({
    id: z.number(),
    packageNumber: z.string().optional(),
    title: z.string().optional(),
    isAvailable: z.boolean().optional(),
    description: z.string().optional(),
    minyaSleeping: z.string().optional(),
    arafatSleeping: z.string().optional(),
    packageNotes: z.string().optional(),
    priceFromSAR: z.number().optional(),
    priceToSAR: z.number().optional(),
    imageUrl: z.string().optional(),
    isFeatured: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { id, title, priceFromSAR, priceToSAR, ...data } = input;
    const updateData: any = { ...data };
    if (title) updateData.titleAr = title;
    if (priceFromSAR) updateData.priceFromSAR = String(priceFromSAR);
    if (priceToSAR) updateData.priceToSAR = String(priceToSAR);
    await db.update(hajjPrograms).set(updateData).where(eq(hajjPrograms.id, id));
    return { success: true };
  }),
  // حذف باقة داخلية
  deletePackage: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(hajjPrograms).where(eq(hajjPrograms.id, input.id));
    return { success: true };
  }),
});

// ─── Hajj International Router (حجاج الخارج) ─────────────────────────────────────────────────────────────────────────────────
const hajjInternationalRouter = router({
  // List packages with country/city filter
  list: publicProcedure.input(z.object({
    countryCode: z.string().optional(),
    countryAr: z.string().optional(),
    cityAr: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    featured: z.boolean().optional(),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { packages: [], total: 0, countries: [] };
    const conditions = [eq(hajjInternationalPackages.isActive, true)];
    if (input.countryCode) conditions.push(eq(hajjInternationalPackages.countryCode, input.countryCode));
    if (input.countryAr) conditions.push(like(hajjInternationalPackages.countryAr, `%${input.countryAr}%`));
    if (input.cityAr) conditions.push(like(hajjInternationalPackages.cityAr, `%${input.cityAr}%`));
    if (input.category) conditions.push(eq(hajjInternationalPackages.category, input.category));
    if (input.featured) conditions.push(eq(hajjInternationalPackages.isFeatured, true));
    if (input.minPrice) conditions.push(gte(hajjInternationalPackages.priceUSD, input.minPrice.toString()));
    if (input.maxPrice) conditions.push(lte(hajjInternationalPackages.priceUSD, input.maxPrice.toString()));
    const packages = await db.select().from(hajjInternationalPackages).where(and(...conditions))
      .orderBy(desc(hajjInternationalPackages.isFeatured), asc(hajjInternationalPackages.sortOrder)).limit(input.limit).offset(input.offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(hajjInternationalPackages).where(and(...conditions));
    // Get distinct countries for filter
    const countries = await db.selectDistinct({ countryCode: hajjInternationalPackages.countryCode, countryAr: hajjInternationalPackages.countryAr, countryEn: hajjInternationalPackages.countryEn })
      .from(hajjInternationalPackages).where(eq(hajjInternationalPackages.isActive, true)).orderBy(asc(hajjInternationalPackages.countryAr));
    return { packages, total: Number(count), countries };
  }),
  // Get single package
  get: publicProcedure.input(z.object({ packageId: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(hajjInternationalPackages).where(eq(hajjInternationalPackages.packageId, input.packageId));
    return rows[0] ?? null;
  }),
  // Get distinct countries list
  listCountries: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.selectDistinct({ countryCode: hajjInternationalPackages.countryCode, countryAr: hajjInternationalPackages.countryAr, countryEn: hajjInternationalPackages.countryEn })
      .from(hajjInternationalPackages).where(eq(hajjInternationalPackages.isActive, true)).orderBy(asc(hajjInternationalPackages.countryAr));
  }),
  // Admin: add package
  add: adminProcedure.input(z.object({
    titleAr: z.string().min(2),
    titleEn: z.string().optional(),
    companyName: z.string().optional(),
    companyNameAr: z.string().optional(),
    companyLogoUrl: z.string().optional(),
    countryCode: z.string().optional(),
    countryAr: z.string().min(2),
    countryEn: z.string().optional(),
    cityAr: z.string().optional(),
    cityEn: z.string().optional(),
    imageUrl: z.string().optional(),
    priceUSD: z.number().min(0),
    priceSAR: z.number().min(0).optional(),
    localCurrency: z.string().optional(),
    localPrice: z.number().min(0).optional(),
    duration: z.number().int().default(21),
    departureDate: z.string().optional(),
    seatsTotal: z.number().int().default(50),
    seatsAvailable: z.number().int().default(50),
    hotelMakkah: z.string().optional(),
    hotelMadinah: z.string().optional(),
    hotelStarRating: z.number().int().default(4),
    features: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    contactPhone: z.string().optional(),
    contactWhatsapp: z.string().optional(),
    contactEmail: z.union([z.string().email(), z.literal("")]).optional(),
    category: z.string().default("standard"),
    isFeatured: z.boolean().default(false),
    isUrgent: z.boolean().default(false),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { nanoid } = await import("nanoid");
    const packageId = `intl_${nanoid(10)}`;
    const { departureDate, ...rest } = input;
    await db.insert(hajjInternationalPackages).values({ ...rest, packageId, priceUSD: rest.priceUSD.toString(), priceSAR: rest.priceSAR?.toString(), localPrice: rest.localPrice?.toString(), departureDate: departureDate ? new Date(departureDate) : undefined } as any);
    return { success: true, packageId };
  }),
  // Admin: update package
  update: adminProcedure.input(z.object({
    packageId: z.string(),
    titleAr: z.string().optional(),
    titleEn: z.string().optional(),
    companyName: z.string().optional(),
    countryCode: z.string().optional(),
    countryAr: z.string().optional(),
    countryEn: z.string().optional(),
    cityAr: z.string().optional(),
    cityEn: z.string().optional(),
    priceUSD: z.number().positive().optional(),
    priceSAR: z.number().positive().optional(),
    imageUrl: z.string().optional(),
    seatsAvailable: z.number().int().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { packageId, ...data } = input;
    const updateData: Record<string, unknown> = { ...data };
    if (typeof updateData.priceUSD === 'number') updateData.priceUSD = updateData.priceUSD.toString();
    if (typeof updateData.priceSAR === 'number') updateData.priceSAR = updateData.priceSAR.toString();
    await db.update(hajjInternationalPackages).set(updateData as any).where(eq(hajjInternationalPackages.packageId, packageId));
    return { success: true };
  }),
  // Admin: delete package
  delete: adminProcedure.input(z.object({ packageId: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(hajjInternationalPackages).where(eq(hajjInternationalPackages.packageId, input.packageId));
    return { success: true };
  }),
});

// ─── AI System Prompt ────────────────────────────────────────────────────────
const GO_UMRAH_SYSTEM_PROMPT = `أنت مساعد ذكي متخصص لمنصة "جو عمرة" (Go Umrah)، وهي منصة إسلامية متكاملة لخدمات الحج والعمرة والسياحة الدينية.

تخصصاتك:
1. **برامج العمرة**: باقات داخلية وخارجية، أسعار، مواعيد، إجراءات التسجيل، متطلبات التأشيرة
2. **برامج الحج**: حجاج الداخل (نسك)، حجاج الخارج، شركات الحجاج المرخصة، إجراءات التسجيل في وزارة الحج
3. **الفنادق**: فنادق مكة المكرمة والمدينة المنورة، القرب من الحرم، التقييمات، الأسعار
4. **الرحلات الجوية**: رحلات من وإلى المملكة العربية السعودية، الشركات الناقلة، الأسعار
5. **التأشيرات**: تأشيرة العمرة، الحج، السياحة، متطلبات كل جنسية
6. **المواصلات**: نقل المعتمرين والحجاج، سيارات VIP، حافلات، قطار الحرمين
7. **الجولات السياحية**: زيارة المواقع الإسلامية في مكة والمدينة والمدينة المنورة
8. **المتجر الإسلامي**: مستلزمات الحج والعمرة، ملابس إحرام، سجادات صلاة، تمور

أسلوبك:
- ردود واضحة ومفيدة باللغة التي يكتب بها المستخدم (عربي أو إنجليزي)
- اقتراح خيارات محددة بدلاً من إجابات عامة
- عند السؤال عن الأسعار، أعطِ نطاقاً تقريبياً مع توضيح أن الأسعار تتغير
- اقترح دائماً الخطوة التالية ("هل تريد حجز باقة؟" أو "هل تحتاج مساعدة في التأشيرة؟")
- كن ودوداً ومحترماً مع مراعاة الطابع الإسلامي للمنصة
- لا تتحدث عن موضوعات خارج نطاق الحج والعمرة والسياحة الإسلامية

معلومات مفيدة:
- موسم العمرة: طوال العام (ما عدا أيام الحج)
- موسم الحج: شهر ذو الحجة (يوم 8-13)
- تأشيرة العمرة: متاحة لمعظم الجنسيات إلكترونياً
- قطار الحرمين: يربط مكة بالمدينة المنورة في ساعتين
- المسافة من المطار إلى الحرم: حوالي 80 كم (مطار جدة)
`;

// ─── Hero Ads Router ────────────────────────────────────────────────────────
const heroAdsRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(heroAds).where(eq(heroAds.isActive, true)).orderBy(asc(heroAds.sortOrder));
  }),
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(heroAds).orderBy(asc(heroAds.sortOrder));
  }),
  create: adminProcedure.input(z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    mediaUrl: z.string().min(1),
    mediaType: z.enum(["image", "video"]).default("image"),
    linkUrl: z.string().optional(),
    linkLabel: z.string().optional(),
    sortOrder: z.number().default(0),
    isActive: z.boolean().default(true),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const now = Date.now();
    await db.insert(heroAds).values({ ...input, createdAt: now, updatedAt: now });
    return { success: true };
  }),
  update: adminProcedure.input(z.object({
    id: z.number(),
    data: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      mediaUrl: z.string().optional(),
      mediaType: z.enum(["image", "video"]).optional(),
      linkUrl: z.string().optional(),
      linkLabel: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(heroAds).set({ ...input.data, updatedAt: Date.now() }).where(eq(heroAds.id, input.id));
    return { success: true };
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(heroAds).where(eq(heroAds.id, input.id));
    return { success: true };
  }),
});

// ─── Search Config Router ─────────────────────────────────────────────────────
const searchConfigRouter = router({
  getByTab: publicProcedure.input(z.object({ tab: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(searchFieldsConfig)
      .where(and(eq(searchFieldsConfig.serviceTab, input.tab), eq(searchFieldsConfig.isEnabled, true)))
      .orderBy(asc(searchFieldsConfig.sortOrder));
  }),
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(searchFieldsConfig).orderBy(asc(searchFieldsConfig.serviceTab), asc(searchFieldsConfig.sortOrder));
  }),
  update: adminProcedure.input(z.object({
    id: z.number(),
    data: z.object({
      labelAr: z.string().optional(),
      labelEn: z.string().optional(),
      isEnabled: z.boolean().optional(),
      sortOrder: z.number().optional(),
      placeholder: z.string().optional(),
    }),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(searchFieldsConfig).set(input.data).where(eq(searchFieldsConfig.id, input.id));
    return { success: true };
  }),
  create: adminProcedure.input(z.object({
    serviceTab: z.string(),
    fieldKey: z.string(),
    labelAr: z.string(),
    labelEn: z.string(),
    fieldType: z.enum(["text", "select", "date", "number", "city"]).default("text"),
    placeholder: z.string().optional(),
    sortOrder: z.number().default(0),
    isEnabled: z.boolean().default(true),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(searchFieldsConfig).values({ ...input, createdAt: Date.now() });
    return { success: true };
  }),
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.delete(searchFieldsConfig).where(eq(searchFieldsConfig.id, input.id));
    return { success: true };
  }),
});

// ─── AI Chat Router ──────────────────────────────────────────────────────────
const aiRouter = router({
  chat: publicProcedure.input(z.object({
    messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() })),
    pageContext: z.string().optional(), // e.g. "umrah", "hajj", "hotels"
  })).mutation(async ({ input }) => {
    const pageContextNote = input.pageContext
      ? `\n\nالمستخدم يتصفح حالياً قسم: ${input.pageContext}. ركّز ردودك على هذا القسم.`
      : "";
    const systemMessage = { role: "system" as const, content: GO_UMRAH_SYSTEM_PROMPT + pageContextNote };
    const allMessages = [systemMessage, ...input.messages] as any[];
    return await invokeLLM({ messages: allMessages });
  }),

  // Quick suggestions based on page context
  getSuggestions: publicProcedure.input(z.object({
    pageContext: z.string().optional(),
  })).query(({ input }) => {
    const suggestions: Record<string, string[]> = {
      umrah: [
        "ما هي أسعار باقات العمرة؟",
        "ما هي متطلبات تأشيرة العمرة؟",
        "ما الفرق بين العمرة الداخلية والخارجية؟",
        "كيف أحجز باقة عمرة مناسبة لعائلتي؟",
      ],
      hajj: [
        "كيف أسجل في نسك للحج الداخلي؟",
        "ما هي أسعار باقات الحج الخارجي؟",
        "ما هي الشركات المرخصة لحجاج الداخل؟",
        "ما هي مراحل الحج وأيامه؟",
      ],
      hotels: [
        "ما أقرب الفنادق من المسجد الحرام؟",
        "ما الفرق بين فنادق مكة والمدينة؟",
        "ما هي أسعار الفنادق في موسم العمرة؟",
        "هل تشمل الباقات الإقامة في الفندق؟",
      ],
      flights: [
        "ما أرخص رحلة إلى جدة؟",
        "ما هي شركات الطيران المتوفرة؟",
        "كم مدة الرحلة من القاهرة إلى جدة؟",
        "هل يمكن الحجز على رحلة مفتوحة العودة؟",
      ],
      visa: [
        "كيف أحصل على تأشيرة العمرة؟",
        "ما المستندات المطلوبة للتأشيرة؟",
        "كم تستغرق تأشيرة العمرة؟",
        "هل التأشيرة متاحة لجميع الجنسيات؟",
      ],
      transport: [
        "ما أسعار النقل من المطار إلى الفندق؟",
        "هل يتوفر قطار الحرمين؟",
        "كيف أحجز سيارة VIP للمعتمرين؟",
        "ما المسافة بين مكة والمدينة؟",
      ],
      tours: [
        "ما المواقع الإسلامية في مكة؟",
        "هل تتوفر جولات في المدينة المنورة؟",
        "ما أبرز المواقع التاريخية للزيارة؟",
        "هل تتوفر جولات بمرشد عربي؟",
      ],
      store: [
        "ما مستلزمات الحج والعمرة الأساسية؟",
        "هل تتوفر ملابس إحرام بمقاسات مختلفة؟",
        "ما أفضل أنواع التمور السعودية؟",
        "هل يتوفر شحن دولي للمتجر؟",
      ],
      default: [
        "ما هي خدمات منصة جو عمرة؟",
        "كيف أحجز باقة عمرة؟",
        "ما أسعار باقات الحج لهذا الموسم؟",
        "كيف أتواصل مع خدمة العملاء؟",
      ],
    };
    const ctx = input.pageContext || "default";
    return suggestions[ctx] || suggestions.default;
  }),
});

// ─── AI Content Generation Router (for Admin) ────────────────────────────────
const aiContentRouter = router({
  generateContent: adminProcedure.input(z.object({
    type: z.enum(["umrah_package", "hajj_package", "hotel", "tour", "transport", "product", "media_post", "visa_package"]),
    hints: z.string().optional(), // optional user hints
    language: z.enum(["ar", "en"]).default("ar"),
  })).mutation(async ({ input }) => {
    const typeLabels: Record<string, string> = {
      umrah_package: "باقة عمرة",
      hajj_package: "باقة حج",
      hotel: "فندق",
      tour: "جولة سياحية إسلامية",
      transport: "خدمة نقل",
      product: "منتج في متجر الحج والعمرة",
      media_post: "مقال أو خبر إسلامي",
      visa_package: "باقة تأشيرة",
    };
    const label = typeLabels[input.type] || input.type;
    const hintsText = input.hints ? `\nملاحظات إضافية: ${input.hints}` : "";
    const lang = input.language === "en" ? "English" : "Arabic";

    const prompt = `أنت خبير في كتابة محتوى تسويقي لمنصة الحج والعمرة "جو عمرة".\nاكتب محتوى احترافياً لـ: ${label}${hintsText}\n\nأرجع JSON بهذا الشكل بالضبط (باللغة ${lang}):\n{\n  "title": "عنوان جذاب ومختصر",\n  "subtitle": "عنوان فرعي توضيحي",\n  "description": "وصف تفصيلي من 2-3 جمل يبرز المميزات والقيمة",\n  "features": ["ميزة 1", "ميزة 2", "ميزة 3", "ميزة 4"],\n  "price_suggestion": "نطاق سعري مقترح بالريال السعودي",\n  "tags": ["وسم1", "وسم2", "وسم3"],\n  "seo_description": "وصف SEO من 150-160 حرف"\n}`;

    const response = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "content_suggestion",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              subtitle: { type: "string" },
              description: { type: "string" },
              features: { type: "array", items: { type: "string" } },
              price_suggestion: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              seo_description: { type: "string" },
            },
            required: ["title", "subtitle", "description", "features", "price_suggestion", "tags", "seo_description"],
            additionalProperties: false,
          },
        },
      } as any,
    });
    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "لم يتمكن الذكاء الاصطناعي من توليد المحتوى" });
    try {
      return JSON.parse(content as string);
    } catch {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "خطأ في تحليل الاستجابة" });
    }
  }),

  improveText: adminProcedure.input(z.object({
    text: z.string().min(1),
    context: z.string().optional(),
  })).mutation(async ({ input }) => {
    const response = await invokeLLM({
      messages: [{
        role: "user",
        content: `أنت خبير في كتابة المحتوى الإسلامي والسياحي.\nحسّن النص التالي ليكون أكثر احترافية وجاذبية لعملاء منصة الحج والعمرة:\n\nالنص الأصلي:\n${input.text}\n${input.context ? `السياق: ${input.context}` : ""}\n\nأرجع النص المحسّن فقط بدون أي شرح.`,
      }],
    });
    return { improved: response.choices?.[0]?.message?.content || input.text };
  }),

  generateImage: adminProcedure.input(z.object({
    type: z.enum(["umrah_package", "hajj_package", "hotel", "tour", "transport", "product", "media_post", "visa_package"]),
    title: z.string().optional(),
  })).mutation(async ({ input }) => {
    const { generateImage } = await import("./_core/imageGeneration");
    const prompts: Record<string, string> = {
      umrah_package: "Professional travel photography of Masjid al-Haram in Mecca with pilgrims performing Tawaf around the Kaaba, golden hour lighting, aerial view, high quality",
      hajj_package: "Aerial view of Mina valley during Hajj season with white tents and pilgrims, Mecca mountains background, professional photography",
      hotel: "Luxury 5-star hotel room with view of Masjid al-Haram in Mecca, elegant Islamic interior design, professional photography",
      tour: "Islamic historical sites in Mecca and Medina, Masjid al-Nabawi, beautiful architecture, professional travel photography",
      transport: "Modern luxury VIP transportation van for Hajj and Umrah pilgrims, clean white vehicle, professional photography",
      product: "Islamic products for Hajj and Umrah: prayer rug, ihram cloth, dates, zamzam water, professional product photography on white background",
      media_post: "Islamic calligraphy with Masjid al-Haram background, professional editorial photography",
      visa_package: "Saudi Arabia visa documents and passport with Kaaba background, professional photography",
    };
    const prompt = input.title
      ? `${prompts[input.type]}, related to: ${input.title}`
      : prompts[input.type];
    const result = await generateImage({ prompt });
    return { url: result.url };
  }),
});

// ─── Hajj Booking Requests Router ───────────────────────────────────────────
const hajjBookingRouter = router({
  list: adminProcedure.input(z.object({ status: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const conditions = [];
    if (input.status && input.status !== "all") conditions.push(eq(hajjBookingRequests.status, input.status as any));
    const rows = await db.select().from(hajjBookingRequests)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(hajjBookingRequests.createdAt)).limit(input.limit).offset(input.offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(hajjBookingRequests)
      .where(conditions.length ? and(...conditions) : undefined);
    return { rows, total: count };
  }),
  create: publicProcedure.input(z.object({
    packageId: z.string().optional(),
    packageTitle: z.string().optional(),
    countryAr: z.string().optional(),
    countryEn: z.string().optional(),
    pilgrims: z.number().default(1),
    customerName: z.string().min(1),
    customerPhone: z.string().optional(),
    customerEmail: z.string().optional(),
    customerWhatsapp: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const requestId = nanoid();
    await db.insert(hajjBookingRequests).values({ ...input, requestId, status: "new" } as any);
    return { requestId };
  }),
  updateStatus: adminProcedure.input(z.object({ id: z.number(), status: z.enum(["new", "reviewing", "confirmed", "cancelled"]) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(hajjBookingRequests).set({ status: input.status }).where(eq(hajjBookingRequests.id, input.id));
    return { success: true };
  }),
  createPayment: publicProcedure.input(z.object({
    bookingId: z.number(),
    totalSAR: z.number().min(1),
    customerEmail: z.string().email(),
  })).mutation(async ({ input }) => {
    const { createInvoice } = await import("./moyasar");
    const invoice = await createInvoice({
      amount: Math.round(input.totalSAR * 100),
      currency: "SAR",
      description: `Hajj Booking #${input.bookingId}`,
      callback_url: `${ENV.isProduction ? "https://go-umrah.com" : "http://localhost:3000"}/api/payment/callback`,
    });
    return { checkoutUrl: invoice.url, invoiceId: invoice.id };
  }),
  // Verify payment
  verifyPayment: publicProcedure.input(z.object({
    bookingId: z.number(),
    invoiceId: z.string(),
  })).mutation(async ({ input }) => {
    const { getInvoice } = await import("./moyasar");
    const invoice = await getInvoice(input.invoiceId);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (invoice.status === "paid") {
      await db.update(hajjBookingRequests)
        .set({ paymentStatus: "paid", paymentIntentId: input.invoiceId, paidAt: new Date() })
        .where(eq(hajjBookingRequests.id, input.bookingId));
      return { success: true, status: "paid" };
    }
    return { success: false, status: invoice.status };
  }),
});

// ─── Umrah Booking Requests Router ────────────────────────────────────────────
const umrahBookingRouter = router({
  list: adminProcedure.input(z.object({ status: z.string().optional(), portalType: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const conditions = [];
    if (input.status && input.status !== "all") conditions.push(eq(umrahBookingRequests.status, input.status as any));
    if (input.portalType && input.portalType !== "all") conditions.push(eq(umrahBookingRequests.portalType, input.portalType as any));
    const rows = await db.select().from(umrahBookingRequests)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(umrahBookingRequests.createdAt)).limit(input.limit).offset(input.offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(umrahBookingRequests)
      .where(conditions.length ? and(...conditions) : undefined);
    return { rows, total: count };
  }),
  create: publicProcedure.input(z.object({
    packageId: z.number().optional(),
    packageTitle: z.string().optional(),
    portalType: z.enum(["domestic", "international"]).default("domestic"),
    departureCity: z.string().optional(),
    countryAr: z.string().optional(),
    pilgrims: z.number().default(1),
    customerName: z.string().min(1),
    customerPhone: z.string().optional(),
    customerEmail: z.string().optional(),
    customerWhatsapp: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const requestId = nanoid();
    await db.insert(umrahBookingRequests).values({ ...input, requestId, status: "new" } as any);
    return { requestId };
  }),
  updateStatus: adminProcedure.input(z.object({ id: z.number(), status: z.enum(["new", "reviewing", "confirmed", "cancelled"]) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(umrahBookingRequests).set({ status: input.status }).where(eq(umrahBookingRequests.id, input.id));
    return { success: true };
  }),
});

// ─── Flexible Request Router ─────────────────────────────────────────────────
const flexibleRequestRouter = router({
  create: publicProcedure.input(z.object({
    serviceType: z.enum(["hajj","umrah","hotel","flight","visa","transport","tour","other"]),
    customerName: z.string().min(2),
    customerPhone: z.string().min(7),
    customerEmail: z.string().email().optional(),
    customerWhatsapp: z.string().optional(),
    nationality: z.string().optional(),
    departureCity: z.string().optional(),
    destination: z.string().optional(),
    travelDate: z.string().optional(),
    returnDate: z.string().optional(),
    adults: z.number().min(1).default(1),
    children: z.number().min(0).default(0),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    currency: z.string().default("SAR"),
    hotelStars: z.number().optional(),
    specialRequirements: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const requestId = nanoid();
    await db.insert(flexibleRequests).values({ ...input, requestId, status: "new" } as any);
    // Notify owner of new flexible request
    const serviceLabels: Record<string, string> = {
      hajj: "حج", umrah: "عمرة", hotel: "فندق", flight: "رحلة", visa: "تأشيرة", transport: "مواصلات", tour: "جولة", other: "أخرى",
    };
    const budgetStr = input.budgetMin || input.budgetMax
      ? `الميزانية: ${input.budgetMin || 0} - ${input.budgetMax || "غير محدد"} ${input.currency}`
      : "ميزانية غير محددة";
    await notifyOwner({
      title: `✨ طلب مرن جديد: ${serviceLabels[input.serviceType] || input.serviceType}`,
      content: [
        `👤 العميل: ${input.customerName}`,
        `📱 الهاتف: ${input.customerPhone}`,
        input.customerEmail ? `📧 البريد: ${input.customerEmail}` : "",
        `🌟 نوع الخدمة: ${serviceLabels[input.serviceType] || input.serviceType}`,
        input.travelDate ? `📅 تاريخ السفر: ${input.travelDate}` : "",
        `👥 عدد الأشخاص: ${input.adults} بالغ + ${input.children} طفل`,
        budgetStr,
        input.specialRequirements ? `📝 متطلبات: ${input.specialRequirements}` : "",
        `🔖 رقم الطلب: ${requestId}`,
      ].filter(Boolean).join("\n"),
    }).catch(() => {}); // don't fail if notification fails
    return { requestId, success: true };
  }),
  list: adminProcedure.input(z.object({
    status: z.enum(["new","reviewing","quoted","confirmed","cancelled"]).optional(),
    serviceType: z.enum(["hajj","umrah","hotel","flight","visa","transport","tour","other"]).optional(),
    limit: z.number().default(50),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(flexibleRequests).orderBy(desc(flexibleRequests.createdAt)).limit(input.limit);
  }),
  updateStatus: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["new","reviewing","quoted","confirmed","cancelled"]),
    adminNotes: z.string().optional(),
    quotedPrice: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.update(flexibleRequests).set({
      status: input.status,
      adminNotes: input.adminNotes,
      quotedPrice: input.quotedPrice ? String(input.quotedPrice) : undefined,
    }).where(eq(flexibleRequests.id, input.id));
    return { success: true };
  }),
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, new: 0, reviewing: 0, quoted: 0 };
    const all = await db.select().from(flexibleRequests);
    return {
      total: all.length,
      new: all.filter(r => r.status === "new").length,
      reviewing: all.filter(r => r.status === "reviewing").length,
      quoted: all.filter(r => r.status === "quoted").length,
    };
  }),
});

// ─── Provider Router ───────────────────────────────────────────────────────────
const providerRouter = router({
  getProfile: providerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (result[0]) return result[0];
    // Auto-create a placeholder profile on first visit
    const defaultName = ctx.user.name ?? `Provider #${ctx.user.id}`;
    await db.insert(providerProfiles).values({
      userId: ctx.user.id,
      companyName: defaultName,
      status: "pending",
    } as any);
    const created = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    return created[0] ?? null;
  }),
  upsertProfile: providerProcedure.input(z.object({
    companyName: z.string().min(1),
    companyNameAr: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseExpiry: z.string().optional(),
    contactPhone: z.string().optional(),
    contactWhatsapp: z.string().optional(),
    contactEmail: z.string().optional(),
    website: z.string().optional(),
    logoUrl: z.string().optional(),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    serviceTypes: z.array(z.string()).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const existing = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (existing.length > 0) {
      await db.update(providerProfiles).set(input as any).where(eq(providerProfiles.userId, ctx.user.id));
    } else {
      await db.insert(providerProfiles).values({ ...input, userId: ctx.user.id } as any);
    }
    return { success: true };
  }),
  listPrograms: providerProcedure.input(z.object({
    programType: z.string().optional(),
    isActive: z.boolean().optional(),
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const profile = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return [];
    const conditions: any[] = [eq(providerPrograms.providerId, profile[0].id)];
    if (input.programType) conditions.push(eq(providerPrograms.programType, input.programType as any));
    if (input.isActive !== undefined) conditions.push(eq(providerPrograms.isActive, input.isActive));
    return db.select().from(providerPrograms).where(and(...conditions)).orderBy(desc(providerPrograms.createdAt)).limit(input.limit).offset(input.offset);
  }),
  createProgram: providerProcedure.input(z.object({
    programType: z.enum(["hajj","umrah","hotel","flight","visa","transport","tour","other"]),
    title: z.string().min(1),
    titleAr: z.string().optional(),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),
    imageUrl: z.string().optional(),
    priceUSD: z.string(),
    originalPriceUSD: z.string().optional(),
    currency: z.string().optional(),
    duration: z.string().optional(),
    capacity: z.number().optional(),
    availableSlots: z.number().optional(),
    departureCity: z.string().optional(),
    destination: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    features: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
    customFields: z.array(z.object({ key: z.string(), label: z.string(), value: z.string() })).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const profile = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Provider profile not found" });
    await db.insert(providerPrograms).values({ ...input, providerId: profile[0].id } as any);
    return { success: true };
  }),
  updateProgram: providerProcedure.input(z.object({
    id: z.number(),
    title: z.string().optional(),
    titleAr: z.string().optional(),
    description: z.string().optional(),
    descriptionAr: z.string().optional(),
    imageUrl: z.string().optional(),
    priceUSD: z.string().optional(),
    originalPriceUSD: z.string().optional(),
    duration: z.string().optional(),
    capacity: z.number().optional(),
    availableSlots: z.number().optional(),
    departureCity: z.string().optional(),
    destination: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    features: z.array(z.string()).optional(),
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
    customFields: z.array(z.object({ key: z.string(), label: z.string(), value: z.string() })).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const profile = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new TRPCError({ code: "NOT_FOUND" });
    const { id, ...rest } = input;
    await db.update(providerPrograms).set(rest as any).where(and(eq(providerPrograms.id, id), eq(providerPrograms.providerId, profile[0].id)));
    return { success: true };
  }),
  deleteProgram: providerProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const profile = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new TRPCError({ code: "NOT_FOUND" });
    await db.delete(providerPrograms).where(and(eq(providerPrograms.id, input.id), eq(providerPrograms.providerId, profile[0].id)));
    return { success: true };
  }),
  listBookings: providerProcedure.input(z.object({
    status: z.string().optional(),
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const profile = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return [];
    const conditions: any[] = [eq(providerBookings.providerId, profile[0].id)];
    if (input.status) conditions.push(eq(providerBookings.status, input.status as any));
    return db.select().from(providerBookings).where(and(...conditions)).orderBy(desc(providerBookings.createdAt)).limit(input.limit).offset(input.offset);
  }),
  updateBookingStatus: providerProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending","confirmed","processing","completed","cancelled","refunded"]),
    providerNotes: z.string().optional(),
    paymentStatus: z.enum(["unpaid","partial","paid","refunded"]).optional(),
    paidAmount: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const profile = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new TRPCError({ code: "NOT_FOUND" });
    const { id, ...rest } = input;
    await db.update(providerBookings).set(rest as any).where(and(eq(providerBookings.id, id), eq(providerBookings.providerId, profile[0].id)));
    return { success: true };
  }),
  getStats: providerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalPrograms: 0, activePrograms: 0, totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, totalRevenue: 0 };
    const profile = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return { totalPrograms: 0, activePrograms: 0, totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, totalRevenue: 0 };
    const programs = await db.select().from(providerPrograms).where(eq(providerPrograms.providerId, profile[0].id));
    const bookingsList = await db.select().from(providerBookings).where(eq(providerBookings.providerId, profile[0].id));
    return {
      totalPrograms: programs.length,
      activePrograms: programs.filter(p => p.isActive).length,
      totalBookings: bookingsList.length,
      pendingBookings: bookingsList.filter(b => b.status === "pending").length,
      confirmedBookings: bookingsList.filter(b => b.status === "confirmed").length,
      totalRevenue: bookingsList.filter(b => b.paymentStatus === "paid").reduce((sum, b) => sum + parseFloat(b.totalUSD as string || "0"), 0),
    };
  }),
  listPublicPrograms: publicProcedure.input(z.object({
    programType: z.string().optional(),
    limit: z.number().optional().default(24),
    offset: z.number().optional().default(0),
    featured: z.boolean().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions: any[] = [eq(providerPrograms.isActive, true)];
    if (input.programType) conditions.push(eq(providerPrograms.programType, input.programType as any));
    if (input.featured) conditions.push(eq(providerPrograms.isFeatured, true));
    // Join with providerProfiles and subscriptions for priority sorting
    const now = new Date();
    const rows = await db
      .select({
        id: providerPrograms.id,
        providerId: providerPrograms.providerId,
        programType: providerPrograms.programType,
        title: providerPrograms.title,
        titleAr: providerPrograms.titleAr,
        description: providerPrograms.description,
        descriptionAr: providerPrograms.descriptionAr,
        imageUrl: providerPrograms.imageUrl,
        priceUSD: providerPrograms.priceUSD,
        originalPriceUSD: providerPrograms.originalPriceUSD,
        duration: providerPrograms.duration,
        capacity: providerPrograms.capacity,
        availableSlots: providerPrograms.availableSlots,
        departureCity: providerPrograms.departureCity,
        destination: providerPrograms.destination,
        startDate: providerPrograms.startDate,
        endDate: providerPrograms.endDate,
        features: providerPrograms.features,
        inclusions: providerPrograms.inclusions,
        isFeatured: providerPrograms.isFeatured,
        rating: providerPrograms.rating,
        reviewCount: providerPrograms.reviewCount,
        createdAt: providerPrograms.createdAt,
        // Provider info
        providerCompanyName: providerProfiles.companyName,
        providerCompanyNameAr: providerProfiles.companyNameAr,
        providerIsVerified: providerProfiles.isVerified,
        providerCity: providerProfiles.city,
        providerCountry: providerProfiles.country,
        // Subscription tier for priority display
        providerPlanSlug: subscriptionPlans.slug,
        providerPlanSortOrder: subscriptionPlans.sortOrder,
        providerHasFeaturedListings: providerSubscriptions.hasFeaturedListings,
      })
      .from(providerPrograms)
      .leftJoin(providerProfiles, eq(providerPrograms.providerId, providerProfiles.id))
      .leftJoin(
        providerSubscriptions,
        and(
          eq(providerSubscriptions.providerId, providerProfiles.id),
          eq(providerSubscriptions.status, "active"),
          gte(providerSubscriptions.endDate, now)
        )
      )
      .leftJoin(subscriptionPlans, eq(providerSubscriptions.planId, subscriptionPlans.id))
      .where(and(...conditions))
      // Sort: featured programs first, then by subscription tier (lower sortOrder = higher tier), then by date
      .orderBy(
        desc(providerPrograms.isFeatured),
        asc(subscriptionPlans.sortOrder),
        desc(providerPrograms.createdAt)
      )
      .limit(input.limit)
      .offset(input.offset);
    return rows;
  }),
  bookProgram: protectedProcedure.input(z.object({
    programId: z.number(),
    customerName: z.string().min(1),
    customerEmail: z.string().optional(),
    customerPhone: z.string().optional(),
    customerWhatsapp: z.string().optional(),
    adults: z.number().optional().default(1),
    children: z.number().optional().default(0),
    totalUSD: z.string(),
    notes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const program = await db.select().from(providerPrograms).where(eq(providerPrograms.id, input.programId)).limit(1);
    if (!program[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Program not found" });
    const bookingRef = nanoid(12).toUpperCase();
    await db.insert(providerBookings).values({
      bookingRef, programId: input.programId, providerId: program[0].providerId,
      customerId: ctx.user.id, customerName: input.customerName,
      customerEmail: input.customerEmail, customerPhone: input.customerPhone,
      customerWhatsapp: input.customerWhatsapp, adults: input.adults,
      children: input.children, totalUSD: input.totalUSD, notes: input.notes,
    } as any);
    await notifyOwner({ title: "حجز جديد لدى مزود خدمة", content: `حجز جديد #${bookingRef} من ${input.customerName} للبرنامج: ${program[0].title}` });
    return { success: true, bookingRef };
  }),
  adminListProviders: adminProcedure.input(z.object({
    status: z.string().optional(),
    limit: z.number().optional().default(50),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions: any[] = [];
    if (input.status) conditions.push(eq(providerProfiles.status, input.status as any));
    return conditions.length > 0
      ? db.select().from(providerProfiles).where(and(...conditions)).orderBy(desc(providerProfiles.createdAt)).limit(input.limit)
      : db.select().from(providerProfiles).orderBy(desc(providerProfiles.createdAt)).limit(input.limit);
  }),
  adminUpdateProviderStatus: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["pending","approved","suspended"]),
    isVerified: z.boolean().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { id, ...rest } = input;
    await db.update(providerProfiles).set(rest as any).where(eq(providerProfiles.id, id));
    return { success: true };
  }),
});

// ─── Provider Applications Router ───────────────────────────────────────────
const providerApplicationRouter = router({
  // User: submit application
  submitApplication: protectedProcedure.input(z.object({
    companyName: z.string().min(2),
    companyNameAr: z.string().optional(),
    companyType: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseExpiry: z.string().optional(),
    licenseAuthority: z.string().optional(),
    contactName: z.string().min(2),
    contactPhone: z.string().min(5),
    contactWhatsapp: z.string().optional(),
    contactEmail: z.string().email(),
    website: z.string().optional(),
    country: z.string().optional().default("SA"),
    city: z.string().optional(),
    address: z.string().optional(),
    serviceTypes: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    // Check if already applied
    const existing = await db.select().from(providerApplications)
      .where(eq(providerApplications.userId, ctx.user.id)).limit(1);
    if (existing[0]) {
      if (existing[0].status === "rejected") {
        // Allow re-apply after rejection
        await db.update(providerApplications).set({ ...input, status: "pending", adminNotes: null, reviewedAt: null, reviewedBy: null } as any)
          .where(eq(providerApplications.userId, ctx.user.id));
        return { success: true, message: "تم إعادة تقديم طلبك بنجاح" };
      }
      throw new TRPCError({ code: "BAD_REQUEST", message: "لديك طلب قيد المراجعة بالفعل" });
    }
    await db.insert(providerApplications).values({ ...input, userId: ctx.user.id } as any);
    await notifyOwner({ title: "طلب انضمام مزود خدمة جديد", content: `${input.companyName} - ${input.contactName} (${input.contactEmail}) طلب الانضمام كمزود خدمة` });
    return { success: true, message: "تم تقديم طلبك بنجاح. سيتم مراجعته خلال 24-48 ساعة" };
  }),

  // User: get my application status
  getMyApplication: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(providerApplications)
      .where(eq(providerApplications.userId, ctx.user.id)).limit(1);
    return result[0] ?? null;
  }),

  // Admin: list all applications
  adminList: adminProcedure.input(z.object({
    status: z.string().optional(),
    limit: z.number().optional().default(100),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions: any[] = [];
    if (input.status) conditions.push(eq(providerApplications.status, input.status as any));
    const apps = conditions.length > 0
      ? await db.select().from(providerApplications).where(and(...conditions)).orderBy(desc(providerApplications.createdAt)).limit(input.limit)
      : await db.select().from(providerApplications).orderBy(desc(providerApplications.createdAt)).limit(input.limit);
    // Attach user info
    const userIds = Array.from(new Set(apps.map(a => a.userId)));
    const userList = userIds.length > 0
      ? await db.select({ id: users.id, name: users.name, email: users.email, role: users.role })
          .from(users).where(sql`${users.id} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)
      : [];
    const userMap = Object.fromEntries(userList.map(u => [u.id, u]));
    return apps.map(a => ({ ...a, user: userMap[a.userId] ?? null }));
  }),

  // Admin: review application (approve/reject)
  adminReview: adminProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["approved", "rejected", "under_review"]),
    adminNotes: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const app = await db.select().from(providerApplications)
      .where(eq(providerApplications.id, input.id)).limit(1);
    if (!app[0]) throw new TRPCError({ code: "NOT_FOUND" });
    await db.update(providerApplications).set({
      status: input.status,
      adminNotes: input.adminNotes ?? null,
      reviewedBy: ctx.user.id,
      reviewedAt: new Date(),
    } as any).where(eq(providerApplications.id, input.id));
    // If approved: upgrade user role to provider AND create provider profile
    if (input.status === "approved") {
      await db.update(users).set({ role: "provider" }).where(eq(users.id, app[0].userId));
      // Create provider profile if not exists
      const existingProfile = await db.select().from(providerProfiles)
        .where(eq(providerProfiles.userId, app[0].userId)).limit(1);
      if (!existingProfile[0]) {
        await db.insert(providerProfiles).values({
          userId: app[0].userId,
          companyName: app[0].companyName,
          companyNameAr: app[0].companyNameAr ?? undefined,
          licenseNumber: app[0].licenseNumber ?? undefined,
          contactPhone: app[0].contactPhone,
          contactEmail: app[0].contactEmail,
          website: app[0].website ?? undefined,
          city: app[0].city ?? undefined,
          country: app[0].country ?? "SA",
          address: app[0].address ?? undefined,
          serviceTypes: app[0].serviceTypes ?? [],
          description: app[0].description ?? undefined,
          status: "approved",
          isVerified: true,
        } as any);
      }
      // Notify admin (owner) about the approval
      await notifyOwner({
        title: "✅ تمت الموافقة على طلب مزود",
        content: `تمت الموافقة على طلب شركة "${app[0].companyName}" وتم منحها صلاحيات مزود خدمة. يمكنهم الآن إضافة برامجهم.`,
      }).catch(() => {});
    } else if (input.status === "rejected") {
      // Notify admin (owner) about the rejection
      await notifyOwner({
        title: "❌ تم رفض طلب مزود",
        content: `تم رفض طلب شركة "${app[0].companyName}".${input.adminNotes ? ` سبب الرفض: ${input.adminNotes}` : ""}`,
      }).catch(() => {});
    } else if (input.status === "under_review") {
      await notifyOwner({
        title: "🔍 طلب مزود قيد المراجعة",
        content: `طلب شركة "${app[0].companyName}" أصبح قيد المراجعة من قبل الفريق.`,
      }).catch(() => {});
    }
    return { success: true };
  }),

  // Admin: stats
  adminStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { pending: 0, under_review: 0, approved: 0, rejected: 0, total: 0 };
    const counts = await db.select({ status: providerApplications.status, count: sql<number>`count(*)` })
      .from(providerApplications).groupBy(providerApplications.status);
    const result = { pending: 0, under_review: 0, approved: 0, rejected: 0, total: 0 };
    counts.forEach(c => {
      const s = c.status as string;
      if (s in result) (result as any)[s] = Number(c.count);
      result.total += Number(c.count);
    });
    return result;
  }),
});

// ─── Roles & Permissions Router ───────────────────────────────────────────────
const SECTIONS = [
  { key: "hajj", label: "الحج" },
  { key: "umrah", label: "العمرة" },
  { key: "hotels", label: "الفنادق" },
  { key: "flights", label: "الرحلات" },
  { key: "visa", label: "التأشيرات" },
  { key: "transport", label: "المواصلات" },
  { key: "tours", label: "الجولات" },
  { key: "store", label: "المتجر" },
  { key: "bookings", label: "الحجوزات" },
  { key: "users", label: "المستخدمون" },
  { key: "analytics", label: "التحليلات" },
  { key: "settings", label: "الإعدادات" },
  { key: "provider_programs", label: "برامج المزودين" },
  { key: "flexible_requests", label: "الطلبات المرنة" },
  { key: "reviews", label: "التقييمات" },
  { key: "assets", label: "إدارة الملفات" },
  { key: "pricing", label: "التسعير الديناميكي" },
  { key: "localization", label: "اللغة والعملة" },
];

const rolesPermissionsRouter = router({
  // List all sections
  listSections: adminProcedure.query(() => SECTIONS),

  // List all roles
  listRoles: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(roles).orderBy(asc(roles.id));
  }),

  // Create role
  createRole: adminProcedure.input(z.object({
    name: z.string().min(2).max(100),
    nameAr: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional().default("#6B7280"),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    await db.insert(roles).values(input as any);
    return { success: true };
  }),

  // Update role
  updateRole: adminProcedure.input(z.object({
    id: z.number(),
    nameAr: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const { id, ...rest } = input;
    await db.update(roles).set(rest as any).where(eq(roles.id, id));
    return { success: true };
  }),

  // Delete role (only non-system)
  deleteRole: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    const role = await db.select().from(roles).where(eq(roles.id, input.id)).limit(1);
    if (role[0]?.isSystem) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن حذف الأدوار الأساسية" });
    await db.delete(roles).where(eq(roles.id, input.id));
    return { success: true };
  }),

  // Get permissions for a user
  getUserPermissions: adminProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(permissions).where(eq(permissions.userId, input.userId));
  }),

  // Set permissions for a user (upsert all sections at once)
  setUserPermissions: adminProcedure.input(z.object({
    userId: z.number(),
    permissions: z.array(z.object({
      section: z.string(),
      canView: z.boolean(),
      canCreate: z.boolean(),
      canEdit: z.boolean(),
      canDelete: z.boolean(),
    })),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    // Delete existing user permissions
    await db.delete(permissions).where(eq(permissions.userId, input.userId));
    // Insert new permissions
    if (input.permissions.length > 0) {
      await db.insert(permissions).values(
        input.permissions.map(p => ({ ...p, userId: input.userId }))
      );
    }
    return { success: true };
  }),

  // Update user role
  updateUserRole: adminProcedure.input(z.object({
    userId: z.number(),
    role: z.enum(["admin", "user", "provider"]),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكنك تغيير دورك الخاص" });
    await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
    return { success: true };
  }),

  // List all users with their permissions
  listUsersWithPermissions: adminProcedure.input(z.object({
    limit: z.number().optional().default(200),
    search: z.string().optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const conditions: any[] = [];
    if (input.search) {
      conditions.push(or(
        like(users.name, `%${input.search}%`),
        like(users.email, `%${input.search}%`)
      ));
    }
    const userList = conditions.length > 0
      ? await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
          .from(users).where(and(...conditions)).orderBy(desc(users.createdAt)).limit(input.limit)
      : await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
          .from(users).orderBy(desc(users.createdAt)).limit(input.limit);
    // Get permissions for all users
    if (userList.length === 0) return [];
    const userIds = userList.map(u => u.id);
    const perms = await db.select().from(permissions)
      .where(sql`${permissions.userId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`);
    const permMap: Record<number, typeof perms> = {};
    perms.forEach(p => {
      if (p.userId) {
        if (!permMap[p.userId]) permMap[p.userId] = [];
        permMap[p.userId].push(p);
      }
    });
    return userList.map(u => ({ ...u, permissions: permMap[u.id] ?? [] }));
  }),

  // Delete user
  deleteUser: adminProcedure.input(z.object({ userId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكنك حذف حسابك الخاص" });
    await db.delete(permissions).where(eq(permissions.userId, input.userId));
    await db.delete(users).where(eq(users.id, input.userId));
    return { success: true };
  }),
});

// ─── App Router ─────────────────────────────────────────────────────────────────────────────────
// ─── Media Center Router ─────────────────────────────────────────────────────
const mediaRouter = router({
  list: publicProcedure.input(z.object({
    type: z.enum(["news", "alert", "article", "announcement"]).optional(),
    category: z.enum(["hajj", "umrah", "hotels", "flights", "visa", "store", "tours", "transport", "general"]).optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    publishedOnly: z.boolean().default(true),
  }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { eq, and, desc, sql: sqlFn } = await import("drizzle-orm");
    const conditions: any[] = [];
    if (input?.publishedOnly !== false) conditions.push(eq(mediaPosts.isPublished, true));
    if (input?.type) conditions.push(eq(mediaPosts.type, input.type));
    if (input?.category) conditions.push(eq(mediaPosts.category, input.category));
    const rows = await db.select().from(mediaPosts)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(mediaPosts.isPinned), desc(mediaPosts.createdAt))
      .limit(input?.limit ?? 20)
      .offset(input?.offset ?? 0);
    return rows;
  }),
  getBreaking: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { eq, and, desc } = await import("drizzle-orm");
    return db.select().from(mediaPosts)
      .where(and(eq(mediaPosts.isPublished, true), eq(mediaPosts.isBreaking, true)))
      .orderBy(desc(mediaPosts.createdAt))
      .limit(10);
  }),
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { eq } = await import("drizzle-orm");
    const [post] = await db.select().from(mediaPosts).where(eq(mediaPosts.id, input.id)).limit(1);
    if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "المنشور غير موجود" });
    // Increment views
    await db.update(mediaPosts).set({ views: post.views + 1 }).where(eq(mediaPosts.id, input.id));
    return { ...post, views: post.views + 1 };
  }),
  create: protectedProcedure.input(z.object({
    type: z.enum(["news", "alert", "article", "announcement"]),
    category: z.enum(["hajj", "umrah", "hotels", "flights", "visa", "store", "tours", "transport", "general"]),
    title: z.string().min(1).max(500),
    summary: z.string().optional(),
    content: z.string().optional(),
    imageUrl: z.string().optional(),
    author: z.string().optional(),
    isPublished: z.boolean().default(false),
    isPinned: z.boolean().default(false),
    isBreaking: z.boolean().default(false),
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const now = Date.now();
    const [result] = await db.insert(mediaPosts).values({
      ...input,
      publishedAt: input.isPublished ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
    return { id: (result as any).insertId };
  }),
  update: protectedProcedure.input(z.object({
    id: z.number(),
    type: z.enum(["news", "alert", "article", "announcement"]).optional(),
    category: z.enum(["hajj", "umrah", "hotels", "flights", "visa", "store", "tours", "transport", "general"]).optional(),
    title: z.string().min(1).max(500).optional(),
    summary: z.string().optional(),
    content: z.string().optional(),
    imageUrl: z.string().optional(),
    author: z.string().optional(),
    isPublished: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    isBreaking: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { eq } = await import("drizzle-orm");
    const { id, ...data } = input;
    const now = Date.now();
    await db.update(mediaPosts).set({ ...data, updatedAt: now }).where(eq(mediaPosts.id, id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { eq } = await import("drizzle-orm");
    await db.delete(mediaPosts).where(eq(mediaPosts.id, input.id));
    return { success: true };
  }),
  togglePublish: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { eq } = await import("drizzle-orm");
    const [post] = await db.select().from(mediaPosts).where(eq(mediaPosts.id, input.id)).limit(1);
    if (!post) throw new TRPCError({ code: "NOT_FOUND" });
    const now = Date.now();
    await db.update(mediaPosts).set({
      isPublished: !post.isPublished,
      publishedAt: !post.isPublished ? now : post.publishedAt,
      updatedAt: now,
    }).where(eq(mediaPosts.id, input.id));
    return { isPublished: !post.isPublished };
  }),
  togglePin: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { eq } = await import("drizzle-orm");
    const [post] = await db.select().from(mediaPosts).where(eq(mediaPosts.id, input.id)).limit(1);
    if (!post) throw new TRPCError({ code: "NOT_FOUND" });
    await db.update(mediaPosts).set({ isPinned: !post.isPinned, updatedAt: Date.now() }).where(eq(mediaPosts.id, input.id));
    return { isPinned: !post.isPinned };
  }),
  toggleBreaking: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { eq } = await import("drizzle-orm");
    const [post] = await db.select().from(mediaPosts).where(eq(mediaPosts.id, input.id)).limit(1);
    if (!post) throw new TRPCError({ code: "NOT_FOUND" });
    await db.update(mediaPosts).set({ isBreaking: !post.isBreaking, updatedAt: Date.now() }).where(eq(mediaPosts.id, input.id));
    return { isBreaking: !post.isBreaking };
  }),
  adminList: protectedProcedure.input(z.object({
    type: z.enum(["news", "alert", "article", "announcement", "all"]).default("all"),
    category: z.enum(["hajj", "umrah", "hotels", "flights", "visa", "store", "tours", "transport", "general", "all"]).default("all"),
  }).optional()).query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    const { desc } = await import("drizzle-orm");
    return db.select().from(mediaPosts).orderBy(desc(mediaPosts.createdAt)).limit(200);
  }),
});

// ─── Waitlist Router ──────────────────────────────────────────────────────────
const waitlistRouter = router({
  subscribe: publicProcedure
    .input(z.object({
      email: z.string().email({ message: "بريد إلكتروني غير صحيح" }),
      name: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const existing = await db.select().from(waitlistEmails)
        .where(eq(waitlistEmails.email, input.email.toLowerCase().trim())).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "هذا البريد مسجّل بالفعل" });
      }
      await db.insert(waitlistEmails).values({
        email: input.email.toLowerCase().trim(),
        name: input.name || null,
        source: "maintenance_page",
        createdAt: Date.now(),
      });
      try {
        await notifyOwner({
          title: "اشتراك جديد في قائمة الانتظار",
          content: `اشترك شخص جديد في قائمة انتظار الإطلاق:\n• البريد: ${input.email}\n• الاسم: ${input.name ?? "غير محدد"}`,
        });
      } catch (_) { /* silent fail */ }
      return { success: true };
    }),

  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(waitlistEmails).orderBy(desc(waitlistEmails.createdAt));
  }),

  count: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { count: 0 };
    const [row] = await db.select({ count: sql<number>`count(*)` }).from(waitlistEmails);
    return { count: Number(row?.count ?? 0) };
  }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(waitlistEmails).where(eq(waitlistEmails.id, input.id));
      return { success: true };
    }),
});

// ─── Payment Router (Moyasar) ─────────────────────────────────────────────────
const paymentRouter = router({
  // إرجاع المفتاح العام لـ Moyasar للواجهة الأمامية
  getPublishableKey: publicProcedure.query(() => {
    return { publishableKey: ENV.moyasarPublishableKey };
  }),
  // إنشاء جلسة دفع للحجز
  createBookingPayment: protectedProcedure
    .input(z.object({
      bookingNumber: z.string(),
      currency: z.string().default("SAR"),
      origin: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [booking] = await db.select().from(bookings)
        .where(and(
          eq(bookings.bookingNumber, input.bookingNumber),
          eq(bookings.userId, ctx.user.id),
        )).limit(1);

      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "الحجز غير موجود" });
      if (booking.paymentStatus === "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "الحجز مدفوع مسبقاً" });

      const amountSAR = usdToSar(parseFloat(booking.totalUSD as string));
      const amountHalala = sarToHalala(amountSAR);

       const baseUrl = input.origin ?? (ENV.isProduction ? "https://go-umrah.com" : "http://localhost:3000");
      // callback_url: Moyasar redirects here after payment (success or failure)
      const callbackUrl = `${baseUrl}/api/payment/callback?bookingNumber=${booking.bookingNumber}`;
      // back_url: shown as "back" button on Moyasar checkout page
      const backUrl = `${baseUrl}/voucher/${booking.bookingNumber}`;
      // Use Invoice API — creates a hosted checkout page on checkout.moyasar.com
      // This avoids any SDK/iframe and eliminates cross-origin Script errors entirely
      const invoice = await createInvoice({
        amount: amountHalala,
        currency: "SAR",
        description: `حجز ${booking.serviceName ?? booking.serviceType} - ${booking.bookingNumber}`,
        callback_url: callbackUrl,
        back_url: backUrl,
        metadata: {
          bookingNumber: booking.bookingNumber,
          serviceType: booking.serviceType,
          userId: String(ctx.user.id),
        },
      });
      await db.update(bookings)
        .set({ paymentIntentId: invoice.id })
        .where(eq(bookings.bookingNumber, booking.bookingNumber));
      return {
        paymentId: invoice.id,
        checkoutUrl: invoice.url,  // https://checkout.moyasar.com/invoices/:id
        amount: amountSAR,
        currency: "SAR",
      };
    }),

  // التحقق من حالة الدفع (يُستدعى من callback page)
  verifyPayment: publicProcedure
    .input(z.object({
      paymentId: z.string(),
      bookingNumber: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const payment = await getPayment(input.paymentId);

      if (payment.status === "paid" || payment.status === "captured") {
        await db.update(bookings)
          .set({
            paymentStatus: "paid",
            status: "confirmed",
            paidAt: new Date(),
            paymentMethod: payment.metadata?.paymentMethod ?? "creditcard",
          })
          .where(eq(bookings.bookingNumber, input.bookingNumber));

        const [updatedBooking] = await db.select().from(bookings)
          .where(eq(bookings.bookingNumber, input.bookingNumber)).limit(1);

        return { success: true, status: "paid", booking: updatedBooking };
      }

      if (payment.status === "failed") {
        return { success: false, status: "failed" };
      }

      return { success: false, status: payment.status };
    }),

  // Webhook من Moyasar (يُستدعى تلقائياً)
  webhook: publicProcedure
    .input(z.object({
      paymentId: z.string(),
      status: z.string(),
    }))
    .mutation(async ({ input }) => {
      if (input.status !== "paid") return { received: true };
      const db = await getDb();
      if (!db) return { received: true };

      const payment = await getPayment(input.paymentId);
      const bookingNumber = payment.metadata?.bookingNumber;
      if (!bookingNumber) return { received: true };

      await db.update(bookings)
        .set({ paymentStatus: "paid", status: "confirmed", paidAt: new Date() })
        .where(eq(bookings.bookingNumber, bookingNumber));

      return { received: true };
    }),
  // نظام دفع موحد لجميع الخدمات
  createUnifiedPayment: protectedProcedure
    .input(z.object({
      serviceType: z.enum(["booking", "order", "visa"]),
      serviceId: z.number(),
      amount: z.number().positive(),
      description: z.string(),
      origin: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const baseUrl = input.origin ?? (ENV.isProduction ? "https://go-umrah.com" : "http://localhost:3000");
      const callbackUrl = `${baseUrl}/api/payment/callback-unified?serviceType=${input.serviceType}&serviceId=${input.serviceId}`;
      const backUrl = `${baseUrl}/${input.serviceType === "booking" ? "voucher" : input.serviceType === "order" ? "orders" : "visas"}`;
      const result = await createUnifiedPayment({
        serviceType: input.serviceType,
        serviceId: input.serviceId,
        amount: input.amount,
        description: input.description,
        callbackUrl,
        backUrl,
        metadata: { userId: String(ctx.user.id) },
      });
      return result;
    }),
  // التحقق من الدفع الموحد
  verifyUnifiedPayment: publicProcedure
    .input(z.object({
      invoiceId: z.string(),
      serviceType: z.enum(["booking", "order", "visa"]),
      serviceId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const result = await verifyUnifiedPayment(input.invoiceId, input.serviceType, input.serviceId);
      return result;
    }),
});

// ─── ZATCA Invoice Router ─────────────────────────────────────────────────────
const invoiceRouter = router({

  // جلب بيانات الفاتورة لحجز معين
  getInvoice: protectedProcedure
    .input(z.object({ bookingNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [booking] = await db.select().from(bookings)
        .where(and(
          eq(bookings.bookingNumber, input.bookingNumber),
          eq(bookings.userId, ctx.user.id),
        )).limit(1);

      if (!booking) throw new TRPCError({ code: "NOT_FOUND" });
      if (booking.paymentStatus !== "paid") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن إصدار فاتورة لحجز غير مدفوع" });
      }

      const amountBeforeVat = usdToSar(parseFloat(booking.totalUSD as string));
      const { vatAmount, totalWithVat } = calculateVat(amountBeforeVat);

      const invoiceData = {
        sellerName: "توعية وضيافة للخدمات التجارية",
        vatNumber: ENV.vatNumber || "300000000000003",
        invoiceDate: (booking.paidAt ?? booking.createdAt).toISOString(),
        totalWithVat,
        vatAmount,
      };

      const zatcaQR = generateZatcaQR(invoiceData);
      const invoiceNumber = generateInvoiceNumber(booking.bookingNumber);

      return {
        invoiceNumber,
        bookingNumber: booking.bookingNumber,
        serviceType: booking.serviceType,
        serviceName: booking.serviceName,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestCount: booking.guestCount,
        issueDate: invoiceData.invoiceDate,
        currency: "SAR",
        amountBeforeVat: amountBeforeVat.toFixed(2),
        vatRate: "15%",
        vatAmount: vatAmount.toFixed(2),
        totalWithVat: totalWithVat.toFixed(2),
        zatcaQR,
        paymentMethod: booking.paymentMethod ?? "creditcard",
        sellerName: invoiceData.sellerName,
        vatNumber: invoiceData.vatNumber,
      };
    }),
});

// ─── LiteAPI Hotels Router ────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  hajj: hajjRouter,
  umrah: umrahRouter,
  hotels: hotelsRouter,
  flights: flightsRouter,
  visa: visaRouter,
  transport: transportRouter,
  tours: toursRouter,
  store: storeRouter,
  bookings: bookingsRouter,
  admin: adminRouter,
  localization: localizationRouter,
  analytics: analyticsRouter,
  assets: assetRouter,
  data: dataRouter,
  pricing: pricingRouter,
  reviews: reviewsRouter,
  seo: seoRouter,
   hajjVertical: hajjVerticalRouter,
  passport: passportRouter,
  train: trainRouter,
  dynamicPricing: dynamicPricingRouter,
  hajjDomestic: hajjDomesticRouter,
  hajjInternational: hajjInternationalRouter,
  hajjBooking: hajjBookingRouter,
  umrahBooking: umrahBookingRouter,
  ai: aiRouter,
  flexibleRequest: flexibleRequestRouter,
  provider: providerRouter,
  providerApplication: providerApplicationRouter,
  rolesPermissions: rolesPermissionsRouter,
  media: mediaRouter,
  aiContent: aiContentRouter,
  heroAds: heroAdsRouter,
  searchConfig: searchConfigRouter,
  marketers: marketersRouter,
  suppliers: suppliersRouter,
  salesCustomers: salesCustomersRouter,
  salesOrders: salesOrdersRouter,
  siteSettings: siteSettingsRouter,
  waitlist: waitlistRouter,
  news: newsRouter,
  customAuth: customAuthRouter,
  profile: profileRouter,
  subscriptions: subscriptionsRouter,
  bookingReviews: bookingReviewsRouter,
  providerNotifications: providerNotificationsRouter,
  payment: paymentRouter,
  invoice: invoiceRouter,
  wishlist: wishlistRouter,
  search: searchRouter,
  coupon: couponRouter,
  recommendations: recommendationRouter,
  chat: chatRouter,
});
export type AppRouter = typeof appRouter;
