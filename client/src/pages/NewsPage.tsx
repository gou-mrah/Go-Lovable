import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ExternalLink, Clock, Globe, Newspaper, Star } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = "all" | "hajj" | "umrah" | "official" | "general";
type Language = "all" | "ar" | "en";

const CATEGORY_LABELS: Record<Category, { ar: string; color: string; bg: string }> = {
  all:      { ar: "جميع الأخبار",   color: "text-white",       bg: "bg-white/20" },
  hajj:     { ar: "أخبار الحج",     color: "text-amber-300",   bg: "bg-amber-500/20" },
  umrah:    { ar: "أخبار العمرة",   color: "text-teal-300",    bg: "bg-teal-500/20" },
  official: { ar: "الأخبار الرسمية", color: "text-blue-300",   bg: "bg-blue-500/20" },
  general:  { ar: "أخبار عامة",     color: "text-purple-300",  bg: "bg-purple-500/20" },
};

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(ts).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" });
}

// ─── News Card ────────────────────────────────────────────────────────────────
function NewsCard({ article }: {
  article: {
    id: number;
    title: string;
    summary: string | null;
    url: string | null;
    imageUrl: string | null;
    category: string;
    language: string;
    isFeatured: boolean | null;
    publishedAt: number;
    sourceName: string | null;
    sourceNameEn: string | null;
  };
}) {
  const cat = CATEGORY_LABELS[article.category as Category] ?? CATEGORY_LABELS.general;
  const isAr = article.language === "ar";

  return (
    <a
      href={article.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c9a84c]/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Image */}
      {article.imageUrl ? (
        <div className="relative h-48 overflow-hidden bg-black/20">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {article.isFeatured && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded-full">
              <Star className="w-3 h-3" />
              مميز
            </div>
          )}
          <div className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm ${cat.bg} ${cat.color} border border-white/10`}>
            {cat.ar}
          </div>
        </div>
      ) : (
        <div className="relative h-32 bg-gradient-to-br from-[#0d3b2e]/80 to-[#1a5c46]/80 flex items-center justify-center">
          <Newspaper className="w-12 h-12 text-[#c9a84c]/40" />
          {article.isFeatured && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded-full">
              <Star className="w-3 h-3" />
              مميز
            </div>
          )}
          <div className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm ${cat.bg} ${cat.color} border border-white/10`}>
            {cat.ar}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h3
          className={`text-white font-semibold leading-snug line-clamp-2 group-hover:text-[#c9a84c] transition-colors ${isAr ? "text-right font-arabic" : "text-left"}`}
          dir={isAr ? "rtl" : "ltr"}
        >
          {article.title}
        </h3>

        {article.summary && (
          <p
            className={`text-white/60 text-sm leading-relaxed line-clamp-3 ${isAr ? "text-right font-arabic" : "text-left"}`}
            dir={isAr ? "rtl" : "ltr"}
          >
            {article.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(article.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {(article.sourceName || article.sourceNameEn) && (
              <span className="text-[#c9a84c]/70 text-xs flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {isAr ? article.sourceName : (article.sourceNameEn ?? article.sourceName)}
              </span>
            )}
            <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-[#c9a84c] transition-colors" />
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function NewsCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <Skeleton className="h-48 w-full bg-white/10" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-5 w-full bg-white/10" />
        <Skeleton className="h-4 w-3/4 bg-white/10" />
        <Skeleton className="h-4 w-1/2 bg-white/10" />
        <div className="flex justify-between pt-2 border-t border-white/10">
          <Skeleton className="h-3 w-20 bg-white/10" />
          <Skeleton className="h-3 w-24 bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [category, setCategory] = useState<Category>("all");
  const [language, setLanguage] = useState<Language>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.news.searchArticles.useQuery({
    page,
    limit: 12,
    category,
    language,
    search: search || undefined,
  });

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setPage(1);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setPage(1);
  };

  const articles = data?.articles ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-[#0a2e1f] text-white" dir="rtl">
      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-b from-[#0d3b2e] to-[#0a2e1f] border-b border-white/10 overflow-hidden">
        {/* Geometric background */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <polygon points="30,0 60,15 60,45 30,60 0,45 0,15" fill="none" stroke="#c9a84c" strokeWidth="0.5" />
                <circle cx="30" cy="30" r="8" fill="none" stroke="#c9a84c" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-sm font-semibold px-4 py-2 rounded-full border border-[#c9a84c]/30 mb-4">
            <Newspaper className="w-4 h-4" />
            مركز الأخبار
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-arabic mb-3">
            أخبار الحج والعمرة
          </h1>
          <p className="text-white/60 text-lg font-arabic max-w-2xl mx-auto">
            تابع أحدث الأخبار والمستجدات المتعلقة بالحج والعمرة من المصادر الرسمية والموثوقة
          </p>
          {total > 0 && (
            <p className="text-[#c9a84c] text-sm mt-3">
              {total.toLocaleString("ar-SA")} خبر متاح
            </p>
          )}
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="sticky top-0 z-20 bg-[#0a2e1f]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="ابحث في الأخبار..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10 text-right font-arabic"
                dir="rtl"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-[#c9a84c] hover:bg-[#b8943d] text-black font-semibold"
            >
              بحث
            </Button>
            {(search || category !== "all" || language !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setCategory("all");
                  setLanguage("all");
                  setPage(1);
                }}
                className="border-white/20 text-white/60 hover:text-white hover:border-white/40"
              >
                مسح
              </Button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {(["all", "hajj", "umrah", "official", "general"] as Category[]).map((cat) => {
              const info = CATEGORY_LABELS[cat];
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold font-arabic transition-all duration-200 border ${
                    isActive
                      ? `${info.bg} ${info.color} border-current shadow-lg`
                      : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {info.ar}
                </button>
              );
            })}

            {/* Language Filter */}
            <div className="mr-auto flex gap-2">
              {([
                { val: "all", label: "الكل" },
                { val: "ar", label: "عربي" },
                { val: "en", label: "English" },
              ] as { val: Language; label: string }[]).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => handleLanguageChange(val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                    language === val
                      ? "bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/40"
                      : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Articles Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <Newspaper className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white/60 text-xl font-arabic mb-2">لا توجد أخبار</h3>
            <p className="text-white/40 text-sm font-arabic">
              {search ? `لا توجد نتائج لـ "${search}"` : "لم يتم العثور على أخبار بهذه الفلاتر"}
            </p>
          </div>
        ) : (
          <>
            {/* Featured articles row */}
            {articles.some((a) => a.isFeatured) && (
              <div className="mb-8">
                <h2 className="text-[#c9a84c] font-arabic font-semibold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  الأخبار المميزة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.filter((a) => a.isFeatured).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {/* All articles */}
            {articles.some((a) => !a.isFeatured) && (
              <div>
                {articles.some((a) => a.isFeatured) && (
                  <h2 className="text-white/60 font-arabic font-semibold text-base mb-4">
                    جميع الأخبار
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {articles.filter((a) => !a.isFeatured).map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-30"
                >
                  السابق
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                          page === pageNum
                            ? "bg-[#c9a84c] text-black"
                            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-white/20 text-white/60 hover:text-white hover:border-white/40 disabled:opacity-30"
                >
                  التالي
                </Button>
              </div>
            )}

            {/* Page info */}
            <p className="text-center text-white/30 text-sm mt-4 font-arabic">
              صفحة {page} من {totalPages} — {total.toLocaleString("ar-SA")} خبر
            </p>
          </>
        )}
      </div>
    </div>
  );
}
