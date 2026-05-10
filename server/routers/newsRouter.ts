import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { newsSources, newsArticles } from "../../drizzle/schema";
import { eq, desc, and, like, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── RSS Parser helper ────────────────────────────────────────────────────────
async function parseRSSFeed(url: string): Promise<Array<{
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  publishedAt: number;
}>> {
  try {
    const db = await getDb();
  if (!db) return [];
  const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GoUmrahBot/1.0; +https://go-umrah.com)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();

    // Parse RSS items
    const items: Array<{
      title: string;
      summary: string;
      url: string;
      imageUrl: string | null;
      publishedAt: number;
    }> = [];

    // Extract items from RSS/Atom
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let itemMatch: RegExpExecArray | null;
    while ((itemMatch = itemRegex.exec(xml)) !== null) {
      const match = itemMatch;
      const itemXml = match[1];
      const title = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link") || extractAttr(itemXml, "link", "href");
      const description = extractTag(itemXml, "description") || extractTag(itemXml, "summary");
      const pubDate = extractTag(itemXml, "pubDate") || extractTag(itemXml, "published");
      const imageUrl =
        extractAttr(itemXml, "enclosure", "url") ||
        extractAttr(itemXml, "media:content", "url") ||
        extractAttr(itemXml, "media:thumbnail", "url") ||
        null;

      if (title && link) {
        items.push({
          title: cleanHtml(title).trim(),
          summary: cleanHtml(description || "").trim().slice(0, 500),
          url: link.trim(),
          imageUrl,
          publishedAt: pubDate ? new Date(pubDate).getTime() : Date.now(),
        });
      }
      if (items.length >= 20) break;
    }

    // Try Atom entries if no RSS items found
    if (items.length === 0) {
      const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
      let entryMatch: RegExpExecArray | null;
      while ((entryMatch = entryRegex.exec(xml)) !== null) {
        const match = entryMatch;
        const entryXml = match[1];
        const title = extractTag(entryXml, "title");
        const link = extractAttr(entryXml, "link", "href") || extractTag(entryXml, "link");
        const summary = extractTag(entryXml, "summary") || extractTag(entryXml, "content");
        const updated = extractTag(entryXml, "updated") || extractTag(entryXml, "published");

        if (title && link) {
          items.push({
            title: cleanHtml(title).trim(),
            summary: cleanHtml(summary || "").trim().slice(0, 500),
            url: link.trim(),
            imageUrl: null,
            publishedAt: updated ? new Date(updated).getTime() : Date.now(),
          });
        }
        if (items.length >= 20) break;
      }
    }

    return items;
  } catch (err) {
    console.error(`[News] RSS fetch error for ${url}:`, err);
    return [];
  }
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, "i"));
  return match ? match[1].trim() : "";
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Keyword filter for Hajj/Umrah relevance ─────────────────────────────────
const HAJJ_UMRAH_KEYWORDS = [
  "حج", "عمرة", "عمره", "مكة", "مكه", "المدينة", "الحرم", "الكعبة", "الكعبه",
  "الحجاج", "المعتمرين", "نسك", "الحرمين", "البيت الحرام", "المشاعر",
  "hajj", "umrah", "makkah", "mecca", "madinah", "medina", "haram",
  "pilgrim", "pilgrimage", "kaaba", "tawaf", "ihram", "zamzam",
  "وزارة الحج", "ministry of hajj", "الطواف", "السعي", "منى", "عرفة", "مزدلفة",
];

function isHajjUmrahRelated(title: string, summary: string): boolean {
  const text = (title + " " + summary).toLowerCase();
  return HAJJ_UMRAH_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

// ─── Main fetch function ──────────────────────────────────────────────────────
export async function fetchNewsFromSource(sourceId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [source] = await (await withDb()).select().from(newsSources).where(eq(newsSources.id, sourceId));
  if (!source || !source.isActive) return 0;
  if (source.type !== "rss") return 0; // Only RSS auto-fetch for now

  const articles = await parseRSSFeed(source.url);
  if (articles.length === 0) return 0;

  let inserted = 0;
  const now = Date.now();

  for (const article of articles) {
    // Check if article already exists (by URL)
    if (article.url) {
      const existing = await (await withDb())!
        .select({ id: newsArticles.id })
        .from(newsArticles)
        .where(eq(newsArticles.url, article.url))
        .limit(1);
      if (existing.length > 0) continue;
    }

    // Filter: only Hajj/Umrah related (skip if source is general)
    if (source.category === "general" && !isHajjUmrahRelated(article.title, article.summary)) {
      continue;
    }

    const category = source.category === "official" ? "official" :
      article.title.toLowerCase().includes("حج") || article.title.toLowerCase().includes("hajj") ? "hajj" :
      article.title.toLowerCase().includes("عمرة") || article.title.toLowerCase().includes("umrah") ? "umrah" :
      "general";

    await (await withDb())!.insert(newsArticles).values({
      sourceId: source.id,
      title: article.title,
      summary: article.summary || null,
      url: article.url || null,
      imageUrl: article.imageUrl || null,
      category: category as "hajj" | "umrah" | "general" | "official",
      language: source.language,
      isPublished: true,
      isFeatured: false,
      publishedAt: article.publishedAt || now,
      createdAt: now,
    });
    inserted++;
  }

  // Update source stats
  await (await withDb())!
    .update(newsSources)
    .set({
      lastFetchedAt: now,
      articlesCount: sql`articles_count + ${inserted}`,
      updatedAt: now,
    })
    .where(eq(newsSources.id, sourceId));

  return inserted;
}


// ─── DB helper for router procedures ─────────────────────────────────────────
async function withDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const newsRouter = router({
  // Public: search/list news with pagination for the dedicated news page
  searchArticles: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
        category: z.enum(["hajj", "umrah", "general", "official", "all"]).default("all"),
        language: z.enum(["ar", "en", "all"]).default("all"),
        search: z.string().optional(),
        sourceId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(newsArticles.isPublished, true)];
      if (input.category !== "all") {
        conditions.push(eq(newsArticles.category, input.category as "hajj" | "umrah" | "general" | "official"));
      }
      if (input.language !== "all") {
        conditions.push(eq(newsArticles.language, input.language));
      }
      if (input.search) {
        conditions.push(like(newsArticles.title, `%${input.search}%`));
      }
      if (input.sourceId) {
        conditions.push(eq(newsArticles.sourceId, input.sourceId));
      }
      const articles = await (await withDb())
        .select({
          id: newsArticles.id,
          title: newsArticles.title,
          summary: newsArticles.summary,
          url: newsArticles.url,
          imageUrl: newsArticles.imageUrl,
          category: newsArticles.category,
          language: newsArticles.language,
          isFeatured: newsArticles.isFeatured,
          publishedAt: newsArticles.publishedAt,
          sourceName: newsSources.nameAr,
          sourceNameEn: newsSources.nameEn,
        })
        .from(newsArticles)
        .leftJoin(newsSources, eq(newsArticles.sourceId, newsSources.id))
        .where(and(...conditions))
        .orderBy(desc(newsArticles.publishedAt))
        .limit(input.limit)
        .offset(offset);
      const [countResult] = await (await withDb())
        .select({ total: sql<number>`count(*)` })
        .from(newsArticles)
        .where(and(...conditions));
      const total = Number(countResult?.total ?? 0);
      return { articles, total, page: input.page, limit: input.limit, totalPages: Math.ceil(total / input.limit) };
    }),

  // Public: get latest news for ticker
  getLatest: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        language: z.enum(["ar", "en", "all"]).default("all"),
        category: z.enum(["hajj", "umrah", "general", "official", "all"]).default("all"),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(newsArticles.isPublished, true)];
      if (input.language !== "all") {
        conditions.push(eq(newsArticles.language, input.language));
      }
      if (input.category !== "all") {
        conditions.push(eq(newsArticles.category, input.category as "hajj" | "umrah" | "general" | "official"));
      }

      const articles = await (await withDb())
        .select({
          id: newsArticles.id,
          title: newsArticles.title,
          summary: newsArticles.summary,
          url: newsArticles.url,
          imageUrl: newsArticles.imageUrl,
          category: newsArticles.category,
          language: newsArticles.language,
          publishedAt: newsArticles.publishedAt,
          sourceName: newsSources.nameAr,
          sourceNameEn: newsSources.nameEn,
        })
        .from(newsArticles)
        .leftJoin(newsSources, eq(newsArticles.sourceId, newsSources.id))
        .where(and(...conditions))
        .orderBy(desc(newsArticles.publishedAt))
        .limit(input.limit);

      return articles;
    }),

  // Admin: list all articles with pagination
  adminList: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        sourceId: z.number().optional(),
        category: z.enum(["hajj", "umrah", "general", "official", "all"]).default("all"),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const conditions = [];
      if (input.sourceId) conditions.push(eq(newsArticles.sourceId, input.sourceId));
      if (input.category !== "all") {
        conditions.push(eq(newsArticles.category, input.category as "hajj" | "umrah" | "general" | "official"));
      }
      if (input.search) {
        conditions.push(like(newsArticles.title, `%${input.search}%`));
      }

      const articles = await (await withDb())
        .select({
          id: newsArticles.id,
          title: newsArticles.title,
          summary: newsArticles.summary,
          url: newsArticles.url,
          imageUrl: newsArticles.imageUrl,
          category: newsArticles.category,
          language: newsArticles.language,
          isPublished: newsArticles.isPublished,
          isFeatured: newsArticles.isFeatured,
          publishedAt: newsArticles.publishedAt,
          createdAt: newsArticles.createdAt,
          sourceId: newsArticles.sourceId,
          sourceName: newsSources.nameAr,
        })
        .from(newsArticles)
        .leftJoin(newsSources, eq(newsArticles.sourceId, newsSources.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(newsArticles.publishedAt))
        .limit(input.limit)
        .offset(offset);

      const [{ total }] = await (await withDb())
        .select({ total: sql<number>`count(*)` })
        .from(newsArticles)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { articles, total, page: input.page, limit: input.limit };
    }),

  // Admin: create manual article
  createArticle: adminProcedure
    .input(
      z.object({
        sourceId: z.number(),
        title: z.string().min(1).max(500),
        summary: z.string().optional(),
        url: z.string().url().optional().or(z.literal("")),
        imageUrl: z.string().url().optional().or(z.literal("")),
        category: z.enum(["hajj", "umrah", "general", "official"]),
        language: z.enum(["ar", "en"]),
        isPublished: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        publishedAt: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const now = Date.now();
      const [result] = await (await withDb()).insert(newsArticles).values({
        sourceId: input.sourceId,
        title: input.title,
        summary: input.summary || null,
        url: input.url || null,
        imageUrl: input.imageUrl || null,
        category: input.category,
        language: input.language,
        isPublished: input.isPublished,
        isFeatured: input.isFeatured,
        publishedAt: input.publishedAt || now,
        createdAt: now,
      });
      return { success: true };
    }),

  // Admin: update article
  updateArticle: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(500).optional(),
        summary: z.string().optional(),
        url: z.string().optional(),
        imageUrl: z.string().optional(),
        category: z.enum(["hajj", "umrah", "general", "official"]).optional(),
        language: z.enum(["ar", "en"]).optional(),
        isPublished: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await (await withDb()).update(newsArticles).set(data).where(eq(newsArticles.id, id));
      return { success: true };
    }),

  // Admin: delete article
  deleteArticle: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await (await withDb()).delete(newsArticles).where(eq(newsArticles.id, input.id));
      return { success: true };
    }),

  // Admin: bulk delete
  bulkDeleteArticles: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      await (await withDb()).delete(newsArticles).where(inArray(newsArticles.id, input.ids));
      return { success: true };
    }),

  // Admin: list sources
  listSources: adminProcedure.query(async () => {
    return await (await withDb()).select().from(newsSources).orderBy(desc(newsSources.createdAt));
  }),

  // Public: list active sources (for display)
  listActiveSources: publicProcedure.query(async () => {
    return await (await withDb())
      .select({
        id: newsSources.id,
        nameAr: newsSources.nameAr,
        nameEn: newsSources.nameEn,
        category: newsSources.category,
        language: newsSources.language,
        articlesCount: newsSources.articlesCount,
        lastFetchedAt: newsSources.lastFetchedAt,
      })
      .from(newsSources)
      .where(eq(newsSources.isActive, true))
      .orderBy(desc(newsSources.articlesCount));
  }),

  // Admin: create source
  createSource: adminProcedure
    .input(
      z.object({
        nameAr: z.string().min(1).max(255),
        nameEn: z.string().optional(),
        type: z.enum(["rss", "scrape", "manual"]),
        url: z.string().min(1),
        logoUrl: z.string().url().optional().or(z.literal("")),
        category: z.enum(["hajj", "umrah", "general", "official"]),
        language: z.enum(["ar", "en"]),
        isActive: z.boolean().default(true),
        fetchInterval: z.number().min(0).max(1440).default(30),
      })
    )
    .mutation(async ({ input }) => {
      const now = Date.now();
      await (await withDb()).insert(newsSources).values({
        nameAr: input.nameAr,
        nameEn: input.nameEn || null,
        type: input.type,
        url: input.url,
        logoUrl: input.logoUrl || null,
        category: input.category,
        language: input.language,
        isActive: input.isActive,
        fetchInterval: input.fetchInterval,
        articlesCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true };
    }),

  // Admin: update source
  updateSource: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nameAr: z.string().min(1).max(255).optional(),
        nameEn: z.string().optional(),
        type: z.enum(["rss", "scrape", "manual"]).optional(),
        url: z.string().min(1).optional(),
        logoUrl: z.string().optional(),
        category: z.enum(["hajj", "umrah", "general", "official"]).optional(),
        language: z.enum(["ar", "en"]).optional(),
        isActive: z.boolean().optional(),
        fetchInterval: z.number().min(0).max(1440).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await (await withDb())
        .update(newsSources)
        .set({ ...data, updatedAt: Date.now() })
        .where(eq(newsSources.id, id));
      return { success: true };
    }),

  // Admin: delete source
  deleteSource: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await (await withDb()).delete(newsArticles).where(eq(newsArticles.sourceId, input.id));
      await (await withDb()).delete(newsSources).where(eq(newsSources.id, input.id));
      return { success: true };
    }),

  // Admin: trigger manual fetch for a source
  fetchSource: adminProcedure
    .input(z.object({ sourceId: z.number() }))
    .mutation(async ({ input }) => {
      const inserted = await fetchNewsFromSource(input.sourceId);
      return { success: true, inserted };
    }),

  // Admin: fetch all active RSS sources
  fetchAllSources: adminProcedure.mutation(async () => {
    const sources = await (await withDb())
      .select()
      .from(newsSources)
      .where(and(eq(newsSources.isActive, true), eq(newsSources.type, "rss")));

    let totalInserted = 0;
    const results: { sourceId: number; name: string; inserted: number; error?: string }[] = [];

    for (const source of sources) {
      try {
        const inserted = await fetchNewsFromSource(source.id);
        totalInserted += inserted;
        results.push({ sourceId: source.id, name: source.nameAr, inserted });
      } catch (err) {
        results.push({ sourceId: source.id, name: source.nameAr, inserted: 0, error: String(err) });
      }
    }

    return { success: true, totalInserted, results };
  }),

  // Admin: get stats
  getStats: adminProcedure.query(async () => {
    const [{ total }] = await (await withDb()).select({ total: sql<number>`count(*)` }).from(newsArticles);
    const [{ published }] = await (await withDb())
      .select({ published: sql<number>`count(*)` })
      .from(newsArticles)
      .where(eq(newsArticles.isPublished, true));
    const [{ sources }] = await (await withDb()).select({ sources: sql<number>`count(*)` }).from(newsSources);
    const [{ activeSources }] = await (await withDb())
      .select({ activeSources: sql<number>`count(*)` })
      .from(newsSources)
      .where(eq(newsSources.isActive, true));

    return { total, published, sources, activeSources };
  }),
});
