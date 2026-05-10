import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import {
  marketers, suppliers, salesCustomers, salesOrders, users,
} from "../../drizzle/schema";
import { eq, desc, like, or, and, sql, asc } from "drizzle-orm";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

// ─── Helper: generate unique marketer code ─────────────────────────────────
async function generateMarketerCode(db: any): Promise<string> {
  const num = Math.floor(100 + Math.random() * 900);
  const code = `MKT-${num}`;
  const existing = await db.select().from(marketers).where(eq(marketers.code, code)).limit(1);
  if (existing.length > 0) return generateMarketerCode(db);
  return code;
}

// ─── Helper: generate unique supplier code ─────────────────────────────────
async function generateSupplierCode(db: any): Promise<string> {
  const num = Math.floor(1000 + Math.random() * 9000);
  const code = `SUP-${num}`;
  const existing = await db.select().from(suppliers).where(eq(suppliers.code, code)).limit(1);
  if (existing.length > 0) return generateSupplierCode(db);
  return code;
}

// ─── Helper: generate order number ─────────────────────────────────────────
async function generateOrderNumber(db: any): Promise<number> {
  const last = await db.select({ n: sql<number>`MAX(order_number)` }).from(salesOrders);
  return (last[0]?.n ?? 0) + 1;
}

// ─── Marketers Router ──────────────────────────────────────────────────────
export const marketersRouter = router({
  list: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      role: z.enum(["marketer", "employee", "all"]).default("all"),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let rows = await db.select().from(marketers).orderBy(desc(marketers.createdAt));
      if (input.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(r =>
          r.nameAr?.toLowerCase().includes(s) ||
          r.code?.toLowerCase().includes(s) ||
          r.phone?.toLowerCase().includes(s) ||
          r.email?.toLowerCase().includes(s)
        );
      }
      if (input.role !== "all") rows = rows.filter(r => r.role === input.role);
      if (input.isActive !== undefined) rows = rows.filter(r => r.isActive === input.isActive);
      return rows;
    }),

  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, active: 0, employees: 0, inactive: 0 };
    const all = await db.select().from(marketers);
    return {
      total: all.length,
      active: all.filter(m => m.isActive && m.role === "marketer").length,
      employees: all.filter(m => m.role === "employee").length,
      inactive: all.filter(m => !m.isActive).length,
    };
  }),

  add: adminProcedure
    .input(z.object({
      nameAr: z.string().min(2),
      nameEn: z.string().optional(),
      gender: z.enum(["male", "female"]).optional(),
      role: z.enum(["marketer", "employee"]).default("marketer"),
      jobTitle: z.string().optional(),
      education: z.string().optional(),
      skills: z.array(z.string()).optional(),
      phone: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      city: z.string().optional(),
      maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
      birthDate: z.string().optional(),
      joinDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const code = await generateMarketerCode(db);
      const now = Date.now();
      await db.insert(marketers).values({
        code,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        gender: input.gender,
        role: input.role,
        jobTitle: input.jobTitle,
        education: input.education,
        skills: input.skills ?? [],
        phone: input.phone,
        email: input.email || undefined,
        city: input.city,
        maritalStatus: input.maritalStatus,
        birthDate: input.birthDate,
        joinDate: input.joinDate,
        notes: input.notes,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, code };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      nameAr: z.string().min(2).optional(),
      nameEn: z.string().optional(),
      gender: z.enum(["male", "female"]).optional(),
      role: z.enum(["marketer", "employee"]).optional(),
      jobTitle: z.string().optional(),
      education: z.string().optional(),
      skills: z.array(z.string()).optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      city: z.string().optional(),
      maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
      birthDate: z.string().optional(),
      joinDate: z.string().optional(),
      isActive: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...data } = input;
      await db.update(marketers).set({ ...data, updatedAt: Date.now() }).where(eq(marketers.id, id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(marketers).where(eq(marketers.id, input.id));
      return { success: true };
    }),

  publicRegister: publicProcedure
    .input(z.object({
      nameAr: z.string().min(2),
      nameEn: z.string().optional(),
      gender: z.enum(["male", "female"]).optional(),
      phone: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      city: z.string().optional(),
      skills: z.array(z.string()).optional(),
      notes: z.string().optional(),
      userId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      // Prevent duplicate applications from the same user
      if (input.userId) {
        const existing = await db.select().from(marketers)
          .where(eq(marketers.userId, input.userId)).limit(1);
        if (existing.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "لديك طلب انضمام مسجل بالفعل" });
        }
      }
      const code = await generateMarketerCode(db);
      const now = Date.now();
      await db.insert(marketers).values({
        code,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        gender: input.gender,
        role: "marketer",
        phone: input.phone,
        email: input.email || undefined,
        city: input.city,
        skills: input.skills ?? [],
        notes: input.notes,
        isActive: false,
        approvalStatus: "pending",
        userId: input.userId,
        createdAt: now,
        updatedAt: now,
      });
      // Notify admin about new marketer application
      try {
        await notifyOwner({
          title: `طلب انضمام مسوق جديد - ${code}`,
          content: `تم استلام طلب انضمام مسوق جديد:\n• الاسم: ${input.nameAr}${input.nameEn ? ` (${input.nameEn})` : ""}\n• الهاتف: ${input.phone ?? "غير محدد"}\n• البريد: ${input.email ?? "غير محدد"}\n• المدينة: ${input.city ?? "غير محددة"}\n• الرمز: ${code}`,
        });
      } catch (_) { /* silent fail */ }
      return { success: true, code };
    }),

  // List pending marketer applications (admin)
  listPending: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(marketers)
      .where(eq(marketers.approvalStatus, "pending"))
      .orderBy(desc(marketers.createdAt));
    return rows;
  }),

  // Approve a marketer and grant role
  approveMarketer: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const now = Date.now();
      const [m] = await db.select().from(marketers).where(eq(marketers.id, input.id)).limit(1);
      if (!m) throw new TRPCError({ code: "NOT_FOUND" });
      await db.update(marketers).set({
        approvalStatus: "approved",
        isActive: true,
        approvedAt: now,
        updatedAt: now,
      }).where(eq(marketers.id, input.id));
      if (m.userId) {
        await db.update(users).set({ role: "marketer" }).where(eq(users.id, m.userId));
      }
      return { success: true };
    }),

  // Reject a marketer application
  rejectMarketer: adminProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(marketers).set({
        approvalStatus: "rejected",
        isActive: false,
        updatedAt: Date.now(),
      }).where(eq(marketers.id, input.id));
      return { success: true };
    }),

  // Get my marketer profile (for logged-in marketer)
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const [m] = await db.select().from(marketers).where(eq(marketers.userId, ctx.user.id)).limit(1);
    return m ?? null;
  }),

  // Get my orders (for logged-in marketer)
  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const [m] = await db.select().from(marketers).where(eq(marketers.userId, ctx.user.id)).limit(1);
    if (!m) return [];
    const orders = await db.select().from(salesOrders)
      .where(eq(salesOrders.marketerId, m.id))
      .orderBy(desc(salesOrders.createdAt));
    return orders;
  }),

  // Link user account to marketer record
  linkUserAccount: protectedProcedure
    .input(z.object({ marketerCode: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [m] = await db.select().from(marketers).where(eq(marketers.code, input.marketerCode)).limit(1);
      if (!m) throw new TRPCError({ code: "NOT_FOUND", message: "رمز المسوق غير صحيح" });
      await db.update(marketers).set({ userId: ctx.user.id, updatedAt: Date.now() }).where(eq(marketers.id, m.id));
      if (m.approvalStatus === "approved") {
        await db.update(users).set({ role: "marketer" }).where(eq(users.id, ctx.user.id));
      }
      return { success: true, marketer: m };
    }),
});

// ─── Suppliers Router ──────────────────────────────────────────────────────
export const suppliersRouter = router({
  list: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      type: z.enum(["individual", "company", "all"]).default("all"),
      approvalStatus: z.enum(["pending", "approved", "rejected", "all"]).default("all"),
      service: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let rows = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
      if (input.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(r =>
          r.nameAr?.toLowerCase().includes(s) ||
          r.companyName?.toLowerCase().includes(s) ||
          r.code?.toLowerCase().includes(s) ||
          r.phone?.toLowerCase().includes(s) ||
          r.licenseNumber?.toLowerCase().includes(s)
        );
      }
      if (input.type !== "all") rows = rows.filter(r => r.type === input.type);
      if (input.approvalStatus !== "all") rows = rows.filter(r => r.approvalStatus === input.approvalStatus);
      if (input.service) rows = rows.filter(r => (r.services as string[] ?? []).includes(input.service!));
      return rows;
    }),

  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, companies: 0, individuals: 0, pending: 0, approved: 0, rejected: 0 };
    const all = await db.select().from(suppliers);
    return {
      total: all.length,
      companies: all.filter(s => s.type === "company").length,
      individuals: all.filter(s => s.type === "individual").length,
      pending: all.filter(s => s.approvalStatus === "pending").length,
      approved: all.filter(s => s.approvalStatus === "approved").length,
      rejected: all.filter(s => s.approvalStatus === "rejected").length,
    };
  }),

  add: adminProcedure
    .input(z.object({
      nameAr: z.string().min(2),
      nameEn: z.string().optional(),
      type: z.enum(["individual", "company"]).default("company"),
      gender: z.enum(["male", "female"]).optional(),
      companyName: z.string().optional(),
      licenseNumber: z.string().optional(),
      commercialRegisterNumber: z.string().optional(),
      licenseFileUrl: z.string().optional(),
      commercialRegisterUrl: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      country: z.string().optional(),
      countryCode: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      services: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const code = await generateSupplierCode(db);
      const now = Date.now();
      await db.insert(suppliers).values({
        code,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        type: input.type,
        gender: input.gender,
        companyName: input.companyName,
        licenseNumber: input.licenseNumber,
        commercialRegisterNumber: input.commercialRegisterNumber,
        licenseFileUrl: input.licenseFileUrl,
        commercialRegisterUrl: input.commercialRegisterUrl,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
        website: input.website,
        country: input.country,
        countryCode: input.countryCode,
        city: input.city,
        address: input.address,
        services: input.services ?? [],
        approvalStatus: "pending",
        notes: input.notes,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, code };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
      type: z.enum(["individual", "company"]).optional(),
      gender: z.enum(["male", "female"]).optional(),
      companyName: z.string().optional(),
      licenseNumber: z.string().optional(),
      commercialRegisterNumber: z.string().optional(),
      licenseFileUrl: z.string().optional(),
      commercialRegisterUrl: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      country: z.string().optional(),
      countryCode: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      services: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...data } = input;
      await db.update(suppliers).set({ ...data, updatedAt: Date.now() }).where(eq(suppliers.id, id));
      return { success: true };
    }),

  approve: adminProcedure
    .input(z.object({ id: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(suppliers).set({
        approvalStatus: "approved",
        approvalNotes: input.notes,
        approvedAt: Date.now(),
        updatedAt: Date.now(),
      }).where(eq(suppliers.id, input.id));
      return { success: true };
    }),

  reject: adminProcedure
    .input(z.object({ id: z.number(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(suppliers).set({
        approvalStatus: "rejected",
        approvalNotes: input.notes,
        updatedAt: Date.now(),
      }).where(eq(suppliers.id, input.id));
      return { success: true };
    }),

  publicRegister: publicProcedure
    .input(z.object({
      nameAr: z.string().min(2),
      nameEn: z.string().optional(),
      type: z.enum(["individual", "company"]).default("company"),
      gender: z.enum(["male", "female"]).optional(),
      companyName: z.string().optional(),
      licenseNumber: z.string().optional(),
      commercialRegisterNumber: z.string().optional(),
      licenseFileUrl: z.string().optional(),
      commercialRegisterUrl: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      country: z.string().optional(),
      countryCode: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      services: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const code = await generateSupplierCode(db);
      const now = Date.now();
      await db.insert(suppliers).values({
        code,
        nameAr: input.nameAr,
        nameEn: input.nameEn,
        type: input.type,
        gender: input.gender,
        companyName: input.companyName,
        licenseNumber: input.licenseNumber,
        commercialRegisterNumber: input.commercialRegisterNumber,
        licenseFileUrl: input.licenseFileUrl,
        commercialRegisterUrl: input.commercialRegisterUrl,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email,
        website: input.website,
        country: input.country,
        countryCode: input.countryCode,
        city: input.city,
        address: input.address,
        services: input.services ?? [],
        approvalStatus: "pending",
        notes: input.notes,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      });
      // Notify admin about new supplier application
      try {
        await notifyOwner({
          title: `طلب انضمام مورد جديد - ${code}`,
          content: `تم استلام طلب انضمام مورد / مزود خدمة جديد:\n• الاسم: ${input.nameAr}${input.nameEn ? ` (${input.nameEn})` : ""}\n• النوع: ${input.type === "company" ? "شركة / مؤسسة" : "فرد"}\n• الهاتف: ${input.phone ?? "غير محدد"}\n• البريد: ${input.email ?? "غير محدد"}\n• الدولة: ${input.country ?? "غير محددة"}\n• الرمز: ${code}`,
        });
      } catch (_) { /* silent fail */ }
      return { success: true, code };
    }),

  // Public file upload for supplier registration (no auth required)
  publicUploadFile: publicProcedure
    .input(z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      fileType: z.string(),
      fileCategory: z.enum(["license", "commercial_register", "other"]),
    }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("../storage");
      const buffer = Buffer.from(input.fileBase64, "base64");
      const ext = input.fileName.split(".").pop() ?? "pdf";
      const key = `suppliers/public/${input.fileCategory}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, buffer, input.fileType);
      return { url };
    }),

  uploadFile: adminProcedure
    .input(z.object({
      fileBase64: z.string(),
      fileName: z.string(),
      fileType: z.string(),
      fileCategory: z.enum(["license", "commercial_register"]),
    }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import("../storage");
      const buffer = Buffer.from(input.fileBase64, "base64");
      const ext = input.fileName.split(".").pop() ?? "pdf";
      const key = `suppliers/${input.fileCategory}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { url } = await storagePut(key, buffer, input.fileType);
      return { url };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(suppliers).where(eq(suppliers.id, input.id));
      return { success: true };
    }),
});

// ─── Sales Customers Router ────────────────────────────────────────────────
export const salesCustomersRouter = router({
  list: adminProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let rows = await db.select().from(salesCustomers).orderBy(desc(salesCustomers.createdAt));
      if (input.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(r => r.nameAr?.toLowerCase().includes(s) || r.phone?.includes(s));
      }
      return rows;
    }),

  add: adminProcedure
    .input(z.object({
      nameAr: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().optional(),
      city: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const now = Date.now();
      const result = await db.insert(salesCustomers).values({ ...input, createdAt: now, updatedAt: now });
      return { success: true, id: (result as any).insertId };
    }),
});

// ─── Sales Orders Router ───────────────────────────────────────────────────
export const salesOrdersRouter = router({
  list: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["pending", "approved", "completed", "cancelled", "all"]).default("all"),
      marketerId: z.number().optional(),
      supplierId: z.number().optional(),
      service: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let rows = await db.select().from(salesOrders).orderBy(desc(salesOrders.createdAt));
      if (input.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(r =>
          r.customerName?.toLowerCase().includes(s) ||
          String(r.orderNumber).includes(s)
        );
      }
      if (input.status !== "all") rows = rows.filter(r => r.status === input.status);
      if (input.marketerId) rows = rows.filter(r => r.marketerId === input.marketerId);
      if (input.supplierId) rows = rows.filter(r => r.supplierId === input.supplierId);
      if (input.service) rows = rows.filter(r => r.service === input.service);
      if (input.dateFrom) rows = rows.filter(r => r.orderDate >= input.dateFrom!);
      if (input.dateTo) rows = rows.filter(r => r.orderDate <= input.dateTo!);
      return rows;
    }),

  stats: adminProcedure
    .input(z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { totalOrders: 0, totalRevenue: 0, totalProfit: 0, totalCommissions: 0 };
      let rows = await db.select().from(salesOrders);
      if (input.dateFrom) rows = rows.filter(r => r.orderDate >= input.dateFrom!);
      if (input.dateTo) rows = rows.filter(r => r.orderDate <= input.dateTo!);
      const active = rows.filter(r => r.status !== "cancelled");
      return {
        totalOrders: rows.length,
        totalRevenue: active.reduce((s, r) => s + Number(r.sellingPrice), 0),
        totalProfit: active.reduce((s, r) => s + Number(r.platformMargin), 0),
        totalCommissions: active.reduce((s, r) => s + Number(r.marketerCommission), 0),
        remaining: active.reduce((s, r) => s + (Number(r.sellingPrice) - Number(r.amountPaid)), 0),
      };
    }),

  marketerStats: adminProcedure
    .input(z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const allOrders = await db.select().from(salesOrders);
      const allMarketers = await db.select().from(marketers);
      let orders = allOrders.filter(o => o.status !== "cancelled");
      if (input.dateFrom) orders = orders.filter(r => r.orderDate >= input.dateFrom!);
      if (input.dateTo) orders = orders.filter(r => r.orderDate <= input.dateTo!);
      return allMarketers.map(m => {
        const mOrders = orders.filter(o => o.marketerId === m.id);
        return {
          id: m.id,
          code: m.code,
          name: m.nameAr,
          totalOrders: mOrders.length,
          totalSales: mOrders.reduce((s, o) => s + Number(o.sellingPrice), 0),
          totalCommission: mOrders.reduce((s, o) => s + Number(o.marketerCommission), 0),
        };
      }).sort((a, b) => b.totalSales - a.totalSales);
    }),

  supplierStats: adminProcedure
    .input(z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const allOrders = await db.select().from(salesOrders);
      const allSuppliers = await db.select().from(suppliers);
      let orders = allOrders.filter(o => o.status !== "cancelled");
      if (input.dateFrom) orders = orders.filter(r => r.orderDate >= input.dateFrom!);
      if (input.dateTo) orders = orders.filter(r => r.orderDate <= input.dateTo!);
      return allSuppliers.map(s => {
        const sOrders = orders.filter(o => o.supplierId === s.id);
        return {
          id: s.id,
          code: s.code,
          name: s.nameAr,
          type: s.type,
          services: s.services,
          totalOrders: sOrders.length,
          totalCost: sOrders.reduce((sum, o) => sum + Number(o.costPrice), 0),
        };
      }).sort((a, b) => b.totalOrders - a.totalOrders);
    }),

  add: adminProcedure
    .input(z.object({
      orderDate: z.string(),
      customerId: z.number().optional(),
      customerName: z.string().optional(),
      customerPhone: z.string().optional(),
      marketerId: z.number().optional(),
      supplierId: z.number().optional(),
      service: z.enum(["umrah", "visa", "hotel", "transport", "hajj", "tour", "other"]).default("umrah"),
      description: z.string().optional(),
      paymentMethod: z.enum(["bank_sar", "bank_egp", "electronic", "cash", "settlement"]).default("cash"),
      currency: z.enum(["SAR", "EGP", "USD"]).default("SAR"),
      costPrice: z.number().default(0),
      marketerCommission: z.number().default(0),
      platformMargin: z.number().default(0),
      sellingPrice: z.number().default(0),
      amountPaid: z.number().default(0),
      status: z.enum(["pending", "approved", "completed", "cancelled"]).default("pending"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const orderNumber = await generateOrderNumber(db);
      const now = Date.now();
      await db.insert(salesOrders).values({
        orderNumber,
        orderDate: input.orderDate,
        customerId: input.customerId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        marketerId: input.marketerId,
        supplierId: input.supplierId,
        service: input.service,
        description: input.description,
        paymentMethod: input.paymentMethod,
        currency: input.currency,
        costPrice: String(input.costPrice),
        marketerCommission: String(input.marketerCommission),
        platformMargin: String(input.platformMargin),
        sellingPrice: String(input.sellingPrice),
        amountPaid: String(input.amountPaid),
        status: input.status,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, orderNumber };
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      orderDate: z.string().optional(),
      customerId: z.number().optional(),
      customerName: z.string().optional(),
      customerPhone: z.string().optional(),
      marketerId: z.number().optional(),
      supplierId: z.number().optional(),
      service: z.enum(["umrah", "visa", "hotel", "transport", "hajj", "tour", "other"]).optional(),
      description: z.string().optional(),
      paymentMethod: z.enum(["bank_sar", "bank_egp", "electronic", "cash", "settlement"]).optional(),
      currency: z.enum(["SAR", "EGP", "USD"]).optional(),
      costPrice: z.number().optional(),
      marketerCommission: z.number().optional(),
      platformMargin: z.number().optional(),
      sellingPrice: z.number().optional(),
      amountPaid: z.number().optional(),
      status: z.enum(["pending", "approved", "completed", "cancelled"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, costPrice, marketerCommission, platformMargin, sellingPrice, amountPaid, ...rest } = input;
      const updateData: any = { ...rest, updatedAt: Date.now() };
      if (costPrice !== undefined) updateData.costPrice = String(costPrice);
      if (marketerCommission !== undefined) updateData.marketerCommission = String(marketerCommission);
      if (platformMargin !== undefined) updateData.platformMargin = String(platformMargin);
      if (sellingPrice !== undefined) updateData.sellingPrice = String(sellingPrice);
      if (amountPaid !== undefined) updateData.amountPaid = String(amountPaid);
      await db.update(salesOrders).set(updateData).where(eq(salesOrders.id, id));
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(salesOrders).where(eq(salesOrders.id, input.id));
      return { success: true };
    }),
});
