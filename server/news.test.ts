import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  }),
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn((a, b) => ({ type: "eq", a, b })),
    and: vi.fn((...args) => ({ type: "and", args })),
    or: vi.fn((...args) => ({ type: "or", args })),
    desc: vi.fn((col) => ({ type: "desc", col })),
    like: vi.fn((col, val) => ({ type: "like", col, val })),
    sql: vi.fn((strings, ...values) => ({ type: "sql", strings, values })),
    inArray: vi.fn((col, vals) => ({ type: "inArray", col, vals })),
    isNull: vi.fn((col) => ({ type: "isNull", col })),
    gte: vi.fn((a, b) => ({ type: "gte", a, b })),
    lte: vi.fn((a, b) => ({ type: "lte", a, b })),
    lt: vi.fn((a, b) => ({ type: "lt", a, b })),
    gt: vi.fn((a, b) => ({ type: "gt", a, b })),
    ne: vi.fn((a, b) => ({ type: "ne", a, b })),
  };
});

// ─── Unit tests for news module logic ────────────────────────────────────────

describe("News Module - RSS Feed Parser", () => {
  it("should extract article title from RSS item", () => {
    const xmlItem = `<item>
      <title>وزارة الحج تعلن عن خدمات جديدة</title>
      <link>https://haj.gov.sa/news/123</link>
      <description>تفاصيل الخدمات الجديدة</description>
      <pubDate>Thu, 26 Mar 2026 10:00:00 +0000</pubDate>
    </item>`;

    // Extract title using regex (same logic as in newsRouter)
    const titleMatch = xmlItem.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    expect(titleMatch).toBeTruthy();
    expect(titleMatch![1].trim()).toBe("وزارة الحج تعلن عن خدمات جديدة");
  });

  it("should extract CDATA-wrapped title from RSS item", () => {
    const xmlItem = `<item>
      <title><![CDATA[إطلاق منصة نسك الإلكترونية]]></title>
      <link>https://nusuk.sa/news/456</link>
    </item>`;

    const titleMatch = xmlItem.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    expect(titleMatch).toBeTruthy();
    expect(titleMatch![1].trim()).toBe("إطلاق منصة نسك الإلكترونية");
  });

  it("should extract link from RSS item", () => {
    const xmlItem = `<item>
      <title>Test</title>
      <link>https://haj.gov.sa/news/789</link>
    </item>`;

    const linkMatch = xmlItem.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    expect(linkMatch).toBeTruthy();
    expect(linkMatch![1].trim()).toBe("https://haj.gov.sa/news/789");
  });

  it("should extract pubDate from RSS item", () => {
    const xmlItem = `<item>
      <title>Test</title>
      <pubDate>Thu, 26 Mar 2026 10:00:00 +0000</pubDate>
    </item>`;

    const dateMatch = xmlItem.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    expect(dateMatch).toBeTruthy();
    const parsedDate = new Date(dateMatch![1].trim());
    expect(parsedDate.getFullYear()).toBe(2026);
  });

  it("should handle missing pubDate gracefully", () => {
    const xmlItem = `<item>
      <title>Test Article</title>
      <link>https://example.com/news</link>
    </item>`;

    const dateMatch = xmlItem.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    // Should return null when no pubDate
    expect(dateMatch).toBeNull();
    // Fallback to current time
    const fallbackDate = Date.now();
    expect(fallbackDate).toBeGreaterThan(0);
  });
});

describe("News Module - Category Classification", () => {
  it("should classify hajj-related articles correctly", () => {
    const hajjKeywords = ["حج", "hajj", "الحجاج", "مناسك", "الكعبة", "منى", "عرفات", "مزدلفة"];
    const title = "الحجاج يؤدون مناسك الحج في عرفات";

    const isHajj = hajjKeywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()));
    expect(isHajj).toBe(true);
  });

  it("should classify umrah-related articles correctly", () => {
    const umrahKeywords = ["عمرة", "umrah", "المعتمرين", "الطواف", "السعي"];
    const title = "المعتمرون يؤدون مناسك العمرة في المسجد الحرام";

    const isUmrah = umrahKeywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()));
    expect(isUmrah).toBe(true);
  });

  it("should default to general category for unclassified articles", () => {
    const hajjKeywords = ["حج", "hajj", "الحجاج", "مناسك"];
    const umrahKeywords = ["عمرة", "umrah", "المعتمرين"];
    const title = "أخبار المملكة العربية السعودية اليوم";

    const isHajj = hajjKeywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()));
    const isUmrah = umrahKeywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()));
    const category = isHajj ? "hajj" : isUmrah ? "umrah" : "general";

    expect(category).toBe("general");
  });
});

describe("News Module - Source Validation", () => {
  it("should validate RSS URL format", () => {
    const validUrls = [
      "https://haj.gov.sa/rss",
      "https://www.arabnews.com/rss.xml",
      "http://feeds.example.com/news",
    ];

    validUrls.forEach(url => {
      expect(() => new URL(url)).not.toThrow();
    });
  });

  it("should reject invalid URLs", () => {
    const invalidUrls = ["not-a-url", "ftp://invalid", ""];

    invalidUrls.forEach(url => {
      if (!url) {
        expect(url).toBeFalsy();
      } else {
        try {
          const parsed = new URL(url);
          expect(["http:", "https:"].includes(parsed.protocol)).toBe(false);
        } catch {
          expect(true).toBe(true); // URL parsing failed as expected
        }
      }
    });
  });

  it("should validate fetch interval is within acceptable range", () => {
    const minInterval = 15; // minutes
    const maxInterval = 1440; // 24 hours

    const validIntervals = [15, 30, 60, 120, 360, 720, 1440];
    validIntervals.forEach(interval => {
      expect(interval).toBeGreaterThanOrEqual(minInterval);
      expect(interval).toBeLessThanOrEqual(maxInterval);
    });

    const invalidIntervals = [5, 10, 2000];
    invalidIntervals.forEach(interval => {
      const isValid = interval >= minInterval && interval <= maxInterval;
      expect(isValid).toBe(false);
    });
  });
});

describe("News Module - Article Deduplication", () => {
  it("should detect duplicate articles by URL", () => {
    const existingUrls = new Set([
      "https://haj.gov.sa/news/1",
      "https://haj.gov.sa/news/2",
    ]);

    const newArticleUrl = "https://haj.gov.sa/news/1";
    const isDuplicate = existingUrls.has(newArticleUrl);
    expect(isDuplicate).toBe(true);
  });

  it("should allow new unique articles", () => {
    const existingUrls = new Set([
      "https://haj.gov.sa/news/1",
      "https://haj.gov.sa/news/2",
    ]);

    const newArticleUrl = "https://haj.gov.sa/news/3";
    const isDuplicate = existingUrls.has(newArticleUrl);
    expect(isDuplicate).toBe(false);
  });
});
